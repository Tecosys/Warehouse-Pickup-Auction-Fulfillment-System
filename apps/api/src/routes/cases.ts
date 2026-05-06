import express from 'express';
import Case from '../models/Case';
import AuctionRun from '../models/AuctionRun';
import Order from '../models/Order';
import Lot from '../models/Lot';
import { NotificationService } from '../services/NotificationService';
import { ActivityService } from '../services/ActivityService';

const router = express.Router();

// Get all cases with filters
router.get('/', async (req, res) => {
  try {
    const { status, type, auctionId, search } = req.query;
    let query: any = {};

    if (status && status !== 'All Statuses') query.status = status;
    if (type && type !== 'All Types') query.type = type;
    if (auctionId && auctionId !== 'All Auctions') query.auctionRun = auctionId;
    
    if (search) {
      query.$or = [
        { customerName: { $regex: search, $options: 'i' } },
        { bidderNumber: { $regex: search, $options: 'i' } },
        { caseNumber: { $regex: search, $options: 'i' } }
      ];
    }

    const cases = await Case.find(query)
      .populate('auctionRun', 'title auctionNumber')
      .populate('order', 'bidderNumber fulfillmentStatus')
      .sort({ createdAt: -1 });
    
    res.json(cases);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get aging stats
router.get('/stats/aging', async (req, res) => {
  try {
    const now = new Date();
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const fortyEightHoursAgo = new Date(now.getTime() - 48 * 60 * 60 * 1000);

    const openCases = await Case.find({ status: { $ne: 'Resolved' } });
    
    const over24h = openCases.filter(c => new Date(c.createdAt) < twentyFourHoursAgo).length;
    const over48h = openCases.filter(c => new Date(c.createdAt) < fortyEightHoursAgo).length;

    res.json({ over24h, over48h });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Create a new case
router.post('/', async (req, res) => {
  try {
    const { orderId, type, lines, notes } = req.body;
    
    const order = await Order.findById(orderId).populate('customer');
    if (!order) return res.status(404).json({ error: 'Order not found' });

    const caseCount = await Case.countDocuments();
    const caseNumber = `CAS-${10000 + caseCount + 1}`;

    const newCase = new Case({
      caseNumber,
      auctionRun: order.auctionRun,
      order: orderId,
      customerName: (order as any).customer?.name || 'Unknown',
      bidderNumber: order.bidderNumber,
      type,
      lines,
      status: 'Open'
    });

    await newCase.save();
    res.status(201).json(newCase);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Update case status or notes
router.patch('/:id', async (req, res) => {
  try {
    const { status, note } = req.body;
    const update: any = {};
    if (status) update.status = status;
    
    const updatedCase = await Case.findByIdAndUpdate(
      req.params.id,
      { $set: update },
      { new: true }
    );

    if (!updatedCase) return res.status(404).json({ error: 'Case not found' });
    res.json(updatedCase);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Process return intake
router.post('/return-intake', async (req, res) => {
  try {
    const { lotId, reason, condition, notes, existingCaseId } = req.body;
    
    const lot = await Lot.findById(lotId).populate('order');
    if (!lot) return res.status(404).json({ error: 'Lot not found' });
    
    const order = lot.order as any;
    if (!order) return res.status(404).json({ error: 'Order not found' });

    let caseToUpdate;

    if (existingCaseId) {
      caseToUpdate = await Case.findById(existingCaseId);
      if (caseToUpdate) {
        caseToUpdate.status = 'In Review';
        caseToUpdate.lines.push({
          lotNumber: lot.lotNumber,
          reason: `Return: ${reason}`,
          notes: `Condition: ${condition}. ${notes}`
        });
        await caseToUpdate.save();
      }
    }

    if (!caseToUpdate) {
      const caseCount = await Case.countDocuments();
      const caseNumber = `CAS-${10000 + caseCount + 1}`;
      caseToUpdate = new Case({
        caseNumber,
        auctionRun: lot.auctionRun,
        order: order._id,
        customerName: order.customerName || 'Unknown',
        bidderNumber: lot.bidderNumber,
        type: 'Return',
        status: 'Open',
        lines: [{
          lotNumber: lot.lotNumber,
          reason,
          notes: `Condition: ${condition}. ${notes}`
        }]
      });
      await caseToUpdate.save();
    }

    // Update lot status
    lot.status = 'Return Received';
    await lot.save();

    // Trigger Notification Type 11
    await NotificationService.send(order._id.toString(), 11, {
      lotNumber: lot.lotNumber
    });

    // Log Activity
    await ActivityService.log({
      type: 'Return',
      title: 'Return Received',
      description: `Lot ${lot.lotNumber} (Bidder #${lot.bidderNumber}) received back.`,
      order: order._id,
      auctionRun: lot.auctionRun,
      metadata: { lotId, reason, condition }
    });

    res.json({ success: true, case: caseToUpdate });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;

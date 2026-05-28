import express from 'express';
import Lot from '../models/Lot';
import Order from '../models/Order';
import Case from '../models/Case';

const router = express.Router();

// GET /api/lots/search — Search lots by lot number or bidder number
router.get('/search', async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) return res.json([]);

    const lots = await Lot.find({
      $or: [
        { lotNumber: q },
        { bidderNumber: q }
      ]
    })
    .populate('auctionRun')
    .populate({ path: 'order', populate: { path: 'customer' } })
    .limit(10);
    
    res.json(lots);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Helper for case auto-creation
async function autoCreateOrUpdateCase(orderId: string, type: 'Missing in Prep' | 'Missing at Release' | 'Refused' | 'Issue' | 'Return' | 'Dispute', lotNumber: string, reason: string, notes: string) {
  const order = await Order.findById(orderId).populate('customer');
  if (!order) return;

  const existingCase = await Case.findOne({ order: orderId, status: 'Open' });
  if (existingCase) {
    existingCase.lines.push({
      lotNumber,
      reason,
      status: 'Open',
      notes
    });
    await existingCase.save();
  } else {
    const caseCount = await Case.countDocuments();
    const caseNumber = `CAS-${10000 + caseCount + 1}`;
    const newCase = new Case({
      caseNumber,
      auctionRun: order.auctionRun,
      order: orderId,
      customer: order.customer?._id || order.customer,
      customerName: (order as any).customer?.name || 'Unknown',
      bidderNumber: order.bidderNumber,
      type,
      status: 'Open',
      lines: [{
        lotNumber,
        reason,
        status: 'Open',
        notes
      }]
    });
    await newCase.save();
  }
}

// PATCH /api/lots/:id — Update lot status and/or pickup location
router.patch('/:id', async (req: any, res: any) => {
  try {
    const { status, finalPickupLocation, notes, staffUser } = req.body;
    const update: any = {};
    if (status !== undefined) update.status = status;
    if (finalPickupLocation !== undefined) update.finalPickupLocation = finalPickupLocation;

    const lot = await Lot.findByIdAndUpdate(req.params.id, { $set: update }, { new: true }).populate('order');
    if (!lot) return res.status(404).json({ error: 'Lot not found' });

    // Auto-create case triggers for prep issues
    if (status === 'Not Found in Prep') {
      await autoCreateOrUpdateCase(
        lot.order._id.toString(),
        'Missing in Prep',
        lot.lotNumber,
        'Not Found in Prep',
        notes || 'Item could not be found in storage during order preparation.'
      );
    } else if (status === 'Hold/Issue' || status === 'Hold / Issue' || status === 'Hold' || status === 'Issue') {
      await autoCreateOrUpdateCase(
        lot.order._id.toString(),
        'Issue',
        lot.lotNumber,
        'Hold / Issue',
        notes || 'Item placed on hold due to quality or verification requirements.'
      );
    }

    // Log Activity
    const { ActivityService } = await import('../services/ActivityService.js');
    const order = lot.order as any;
    await ActivityService.log({
      type: 'Preparation',
      title: 'Lot Status Updated',
      description: `Lot ${lot.lotNumber} status changed to ${status || lot.status}.`,
      order: order._id,
      customer: order.customer,
      lot: lot._id,
      auctionRun: lot.auctionRun,
      statusBefore: 'Pending',
      statusAfter: status || lot.status,
      user: req.headers['x-user-name'] || staffUser || 'System'
    });

    res.json(lot);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;

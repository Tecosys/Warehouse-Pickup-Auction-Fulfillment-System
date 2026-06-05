import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import Case from '../models/Case';
import AuctionRun from '../models/AuctionRun';
import Order from '../models/Order';
import Lot from '../models/Lot';
import Credit from '../models/Credit';
import Customer from '../models/Customer';
import Settings from '../models/Settings';
import { NotificationService } from '../services/NotificationService';
import { ActivityService } from '../services/ActivityService';

const router = express.Router();

// Multer config for file uploads (photos/videos stored statelessly as Base64)
const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

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
      .populate('order', 'bidderNumber fulfillmentStatus bookingCode')
      .sort({ createdAt: -1 });
    
    res.json(cases);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get cases by Order ID
router.get('/orders/:orderId', async (req, res) => {
  try {
    const cases = await Case.find({ order: req.params.orderId })
      .populate('auctionRun', 'title auctionNumber')
      .sort({ createdAt: -1 });
    res.json(cases);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Upload evidence file
router.post('/upload-evidence', upload.single('file'), (req: any, res: any) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded.' });
    }
    const base64Data = req.file.buffer.toString('base64');
    const dataUri = `data:${req.file.mimetype};base64,${base64Data}`;
    res.json({ filePath: dataUri });
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
    const { orderId, type, lines, evidence, refundStatus, refundAmount, refundMethod } = req.body;
    
    const order = await Order.findById(orderId).populate('customer');
    if (!order) return res.status(404).json({ error: 'Order not found' });

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
      lines: lines || [],
      evidence: evidence || [],
      refundStatus: refundStatus || 'None',
      refundAmount: refundAmount || 0,
      refundMethod: refundMethod || '',
      status: 'Open'
    });

    await newCase.save();

    await ActivityService.log({
      type: 'Return',
      title: 'Case Created',
      description: `Case ${caseNumber} (${type}) created for Bidder #${order.bidderNumber}.`,
      order: order._id,
      customer: order.customer?._id || order.customer,
      auctionRun: order.auctionRun,
      statusBefore: 'None',
      statusAfter: 'Open',
      user: req.headers['x-user-name'] || req.body.staffUser || 'System'
    });

    res.status(201).json(newCase);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Update case details, status, refund, etc.
router.patch('/:id', async (req, res) => {
  try {
    const { status, refundStatus, refundAmount, refundMethod, note, lines } = req.body;
    const update: any = {};
    if (status !== undefined) update.status = status;
    if (refundStatus !== undefined) update.refundStatus = refundStatus;
    if (refundAmount !== undefined) update.refundAmount = refundAmount;
    if (refundMethod !== undefined) update.refundMethod = refundMethod;
    
    const originalCase = await Case.findById(req.params.id);
    if (!originalCase) return res.status(404).json({ error: 'Case not found' });

    if (note) {
      // Append note as a case line or resolution update
      update.lines = [...originalCase.lines, {
        lotNumber: 'GENERAL',
        reason: 'Staff Update',
        status: status || originalCase.status,
        notes: note
      }];
    } else if (lines) {
      update.lines = lines;
    }

    const updatedCase = await Case.findByIdAndUpdate(
      req.params.id,
      { $set: update },
      { new: true }
    );

    if (!updatedCase) return res.status(404).json({ error: 'Case not found' });

    // Check if case just resolved with Store Credit refund and has not issued credit yet
    const isStoreCredit = (refundMethod === 'Store Credit' || (refundMethod === undefined && originalCase.refundMethod === 'Store Credit'));
    const isResolved = (status === 'Resolved' || (status === undefined && originalCase.status === 'Resolved'));
    const wasAlreadyResolved = originalCase.status === 'Resolved';
    
    if (isResolved && !wasAlreadyResolved && isStoreCredit && (refundAmount > 0 || (refundAmount === undefined && originalCase.refundAmount > 0)) && !originalCase.creditGenerated) {
      const finalRefundAmt = refundAmount !== undefined ? refundAmount : originalCase.refundAmount;
      
      const newCredit = new Credit({
        customer: updatedCase.customer,
        sourceCase: updatedCase._id,
        sourceOrder: updatedCase.order,
        amount: finalRefundAmt,
        reason: `Case Resolution: ${updatedCase.caseNumber}`,
        remainingBalance: finalRefundAmt,
        createdBy: 'Staff'
      });
      await newCredit.save();

      // Update case to link generated credit
      updatedCase.creditGenerated = newCredit._id;
      await updatedCase.save();

      // Update Customer's credit balance
      await Customer.findByIdAndUpdate(updatedCase.customer, {
        $inc: { creditBalance: finalRefundAmt }
      });
    }

    await ActivityService.log({
      type: 'Return',
      title: 'Case Updated',
      description: `Case ${updatedCase.caseNumber} status updated to ${updatedCase.status}, refund status: ${updatedCase.refundStatus}.`,
      order: updatedCase.order,
      customer: updatedCase.customer?._id || updatedCase.customer,
      auctionRun: updatedCase.auctionRun,
      statusBefore: originalCase.status,
      statusAfter: updatedCase.status,
      notes: note || `Refund Status: ${updatedCase.refundStatus}`,
      user: req.headers['x-user-name'] || req.body.staffUser || 'System'
    });

    res.json(updatedCase);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Process return intake
router.post('/return-intake', async (req, res) => {
  try {
    const { lotId, reason, condition, notes, existingCaseId, override } = req.body;
    
    const lot = await Lot.findById(lotId).populate({ path: 'order', populate: { path: 'customer' } });
    if (!lot) return res.status(404).json({ error: 'Lot not found' });
    
    const order = lot.order as any;
    if (!order) return res.status(404).json({ error: 'Order not found' });

    // 1. Check Grade Eligibility (Grade A & B only)
    const grade = (lot.condition || '').toUpperCase().trim();
    const isEligibleGrade = !lot.condition || 
      grade.startsWith('A') || 
      grade.startsWith('B') || 
      grade.includes('GRADE A') || 
      grade.includes('GRADE B');

    if (!isEligibleGrade && !override) {
      return res.status(400).json({ 
        error: `Item is not eligible for return. Grade is "${lot.condition}" (Only Grade A & B are returnable).` 
      });
    }

    // 2. Check dynamic dispute window
    if (!order.completeTimestamp && !override) {
      return res.status(400).json({ 
        error: 'Order has not been released yet. Returns can only be processed after pickup.' 
      });
    }

    const dwSetting = await Settings.findOne({ key: 'dispute_window_hours' });
    const disputeWindowHours = dwSetting ? parseInt(dwSetting.value, 10) : 24;

    const now = new Date();
    const diffMs = now.getTime() - new Date(order.completeTimestamp || now).getTime();
    const diffHours = diffMs / (1000 * 60 * 60);
    if (diffHours > disputeWindowHours && !override) {
      return res.status(400).json({ 
        error: `Return window expired. Item was picked up ${Math.round(diffHours)} hours ago (${disputeWindowHours}-hour limit).` 
      });
    }

    let caseToUpdate;

    if (existingCaseId) {
      caseToUpdate = await Case.findById(existingCaseId);
      if (caseToUpdate) {
        caseToUpdate.status = 'In Review';
        caseToUpdate.lines.push({
          lotNumber: lot.lotNumber,
          reason: `Return: ${reason}`,
          status: 'Returned',
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
        customer: order.customer?._id || order.customer,
        customerName: order.customer?.name || 'Unknown',
        bidderNumber: order.bidderNumber,
        type: 'Return',
        status: 'Open',
        lines: [{
          lotNumber: lot.lotNumber,
          reason,
          status: 'Returned',
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
      description: `Lot ${lot.lotNumber} (Bidder #${order.bidderNumber}) received back.`,
      order: order._id,
      customer: order.customer?._id || order.customer,
      lot: lot._id,
      auctionRun: lot.auctionRun,
      statusBefore: 'Released',
      statusAfter: 'Return Received',
      notes: `Condition: ${condition}. Reason: ${reason}. Notes: ${notes || ''}`,
      user: req.headers['x-user-name'] || req.body.staffUser || 'System',
      metadata: { lotId, reason, condition }
    });

    res.json({ success: true, case: caseToUpdate });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get a single case by ID
router.get('/:id', async (req, res) => {
  try {
    const caseData = await Case.findById(req.params.id)
      .populate('auctionRun', 'title auctionNumber')
      .populate('order', 'bidderNumber fulfillmentStatus bookingCode');
    if (!caseData) return res.status(404).json({ error: 'Case not found' });
    res.json(caseData);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Release a previously withheld lot from a case (Found & Released)
router.post('/:id/release-lot', async (req, res) => {
  try {
    const { lotNumber } = req.body;
    const caseId = req.params.id;

    const currentCase = await Case.findById(caseId);
    if (!currentCase) return res.status(404).json({ error: 'Case not found' });

    // 1. Find and update the Lot
    const lot = await Lot.findOne({ order: currentCase.order, lotNumber });
    if (!lot) return res.status(404).json({ error: 'Lot not found for this order' });

    lot.status = 'Ready';
    lot.releaseStatus = 'Released';
    await lot.save();

    // 2. Update the case line
    let updatedLine = false;
    currentCase.lines = currentCase.lines.map(line => {
      if (line.lotNumber === lotNumber) {
        updatedLine = true;
        return {
          lotNumber: line.lotNumber,
          reason: line.reason,
          status: 'Resolved',
          notes: `${line.notes || ''}\n[Staff update]: Item found and released.`
        };
      }
      return line;
    });

    // 3. Add a log entry in case lines
    currentCase.lines.push({
      lotNumber: 'GENERAL',
      reason: 'Staff Action',
      status: currentCase.status,
      notes: `Lot ${lotNumber} found and released by staff.`
    });

    // Check if there are other unresolved lots in the case
    const hasUnresolvedLines = currentCase.lines.some(l => l.lotNumber !== 'GENERAL' && l.status !== 'Resolved');
    if (!hasUnresolvedLines) {
      currentCase.status = 'Resolved';
    }

    await currentCase.save();

    // 4. Update the order pickupStatus if ALL lots are now released
    const allLots = await Lot.find({ order: currentCase.order });
    const allReleased = allLots.every(l => l.releaseStatus === 'Released');
    if (allReleased) {
      await Order.findByIdAndUpdate(currentCase.order, {
        pickupStatus: 'Released',
        lifecycleStatus: 'Released'
      });
    }

    // 5. Log Activity
    await ActivityService.log({
      type: 'Release',
      title: 'Lot Found & Released',
      description: `Withheld Lot ${lotNumber} marked as Found & Released via Case ${currentCase.caseNumber}.`,
      order: currentCase.order,
      customer: currentCase.customer,
      lot: lot._id,
      auctionRun: currentCase.auctionRun,
      statusBefore: 'Not Found',
      statusAfter: 'Released',
      user: (req.headers['x-user-name'] as string) || 'Staff'
    });

    res.json(currentCase);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;

import express from 'express';
import { NotificationService } from '../services/NotificationService.js';
import Notification from '../models/Notification.js';
import Customer from '../models/Customer.js';
import NotificationTemplate from '../models/NotificationTemplate.js';

const router = express.Router();

// Send batch to all customers in a run
router.post('/batch', async (req: any, res: any) => {
  try {
    const { auctionRunId, type, bidderNumber, noChoiceOnly } = req.body;
    if (!auctionRunId || !type) return res.status(400).json({ error: 'Missing run ID or type' });

    const results = await NotificationService.sendBatch(auctionRunId, type, { bidderNumber, noChoiceOnly });
    res.json({ success: true, count: results.length });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get all notification logs (for admin overview) — MUST be before /:orderId
router.get('/logs/all', async (req: any, res: any) => {
  try {
    const { search, status, type, auctionRunId } = req.query;
    const query: any = {};

    if (auctionRunId) {
      query.auctionRun = auctionRunId;
    }

    if (status && status !== 'All') {
      query.status = status;
    }

    if (type && type !== 'All') {
      query.type = parseInt(type, 10);
    }

    if (search) {
      const customers = await Customer.find({
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { bidderNumber: { $regex: search, $options: 'i' } }
        ]
      });
      const customerIds = customers.map(c => c._id);
      query.$or = [
        { customer: { $in: customerIds } },
        { name: { $regex: search, $options: 'i' } } // Fallback for general matches
      ];
    }

    const logs = await Notification.find(query)
      .populate('customer')
      .sort({ createdAt: -1 })
      .limit(100);
    res.json(logs);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get notification logs for a specific order
router.get('/logs/:orderId', async (req: any, res: any) => {
  try {
    const logs = await Notification.find({ order: req.params.orderId }).sort({ createdAt: -1 });
    res.json(logs);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get editable templates list
router.get('/templates', async (req: any, res: any) => {
  try {
    const templates = [];
    for (let i = 1; i <= 13; i++) {
      const t = await NotificationService.getTemplate(i);
      if (t) templates.push(t);
    }
    res.json(templates);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Update a template
router.put('/templates/:templateId', async (req: any, res: any) => {
  try {
    const { name, channel, smsText, emailSubject, emailBody, isEnabled } = req.body;
    const template = await NotificationTemplate.findOneAndUpdate(
      { templateId: parseInt(req.params.templateId, 10) },
      { 
        $set: { 
          name, 
          channel, 
          smsText, 
          emailSubject, 
          emailBody, 
          isEnabled 
        } 
      },
      { new: true }
    );
    if (!template) return res.status(404).json({ error: 'Template not found' });
    res.json(template);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;

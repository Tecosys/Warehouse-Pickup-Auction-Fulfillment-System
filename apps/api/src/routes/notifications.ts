import express from 'express';
import { NotificationService } from '../services/NotificationService';
import Notification from '../models/Notification';

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
    const logs = await Notification.find().populate('customer').sort({ createdAt: -1 }).limit(100);
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

export default router;

import express from 'express';
import Order from '../models/Order';
import { NotificationService } from '../services/NotificationService';
import { ActivityService } from '../services/ActivityService';

const router = express.Router();

// Get shipping queue
router.get('/queue', async (req, res) => {
  try {
    const orders = await Order.find({ 
      retrievalMethod: 'Shipping',
      shippingStatus: 'In Queue'
    }).populate('auctionRun');
    res.json(orders);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Get prepared shipping
router.get('/prepared', async (req, res) => {
  try {
    const orders = await Order.find({ 
      retrievalMethod: 'Shipping',
      shippingStatus: 'Prepared'
    }).populate('auctionRun');
    res.json(orders);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Get dispatched shipping
router.get('/dispatched', async (req, res) => {
  try {
    const orders = await Order.find({ 
      retrievalMethod: 'Shipping',
      shippingStatus: 'Dispatched'
    }).sort({ shippedAt: -1 }).limit(100).populate('auctionRun');
    res.json(orders);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Mark as Prepared
router.patch('/:id/prepare', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    order.shippingStatus = 'Prepared';
    await order.save();

    await ActivityService.log({
      type: 'Preparation',
      title: 'Shipping Prepared',
      description: `Shipping order for Bidder #${order.bidderNumber} moved to Prepared queue.`,
      order: order._id,
      auctionRun: order.auctionRun
    });

    res.json(order);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Mark as Dispatched
router.patch('/:id/dispatch', async (req, res) => {
  try {
    const { trackingNumber } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    order.shippingStatus = 'Dispatched';
    order.trackingNumber = trackingNumber;
    order.shippedAt = new Date();
    await order.save();

    // TRIGGER: Tracking Sent (Type 13)
    await NotificationService.send(order._id.toString(), 13, {
      trackingNumber: trackingNumber
    });

    await ActivityService.log({
      type: 'System',
      title: 'Order Dispatched',
      description: `Order for Bidder #${order.bidderNumber} dispatched with tracking: ${trackingNumber}.`,
      order: order._id,
      auctionRun: order.auctionRun,
      metadata: { trackingNumber }
    });

    res.json(order);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

export default router;

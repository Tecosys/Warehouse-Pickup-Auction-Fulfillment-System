import express from 'express';
import Order from '../models/Order';
import { NotificationService } from '../services/NotificationService';

const router = express.Router();

// Update order status (with auto-triggers)
router.patch('/:id', async (req: any, res: any) => {
  try {
    const { fulfillmentStatus, customerStatus } = req.body;
    const oldOrder = await Order.findById(req.params.id);
    if (!oldOrder) return res.status(404).json({ error: 'Order not found' });

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );

    if (!order) return res.status(404).json({ error: 'Order not found' });

    // TRIGGER: Ready for Pickup
    if (oldOrder.fulfillmentStatus !== 'Ready' && fulfillmentStatus === 'Ready') {
      await NotificationService.send(order._id.toString(), 3); // Type 3: Ready for Pickup
    }

    // TRIGGER: Pickup Confirmation
    if (oldOrder.customerStatus !== 'Picked Up' && customerStatus === 'Picked Up') {
      await NotificationService.send(order._id.toString(), 10, {
        date: new Date().toLocaleDateString(),
        time: new Date().toLocaleTimeString()
      }); // Type 10: Pickup Confirmation
    }

    res.json(order);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;

import express from 'express';
import mongoose from 'mongoose';
import Order from '../models/Order';
import Slot from '../models/Slot';
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

// Atomic Booking with Capacity Gate
router.post('/:id/book', async (req: any, res: any) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { slotId } = req.body;
    const orderId = req.params.id;

    // 1. Find and update slot atomically if capacity remains
    const slot = await Slot.findOneAndUpdate(
      { _id: slotId, $expr: { $lt: ["$currentBookings", "$maxCapacity"] } },
      { $inc: { currentBookings: 1 } },
      { new: true, session }
    );

    if (!slot) {
      throw new Error('Slot is full or no longer available');
    }

    // 2. Update the order
    const order = await Order.findByIdAndUpdate(
      orderId,
      { 
        customerStatus: 'Booked',
        appointmentTime: new Date(`${slot.date}T${slot.startTime}:00`),
        selectedSlot: slotId
      },
      { new: true, session }
    );

    await session.commitTransaction();

    // 3. Trigger Notification (Type 4: Booking Confirmation)
    await NotificationService.send(orderId, 4, {
      date: slot.date,
      time: slot.startTime
    });

    res.json(order);
  } catch (error: any) {
    await session.abortTransaction();
    res.status(400).json({ error: error.message });
  } finally {
    session.endSession();
  }
});

export default router;

import express from 'express';
import mongoose from 'mongoose';
import Order from '../models/Order';
import Lot from '../models/Lot';
import Slot from '../models/Slot';
import { NotificationService } from '../services/NotificationService';
import { ActivityService } from '../services/ActivityService';

const router = express.Router();

/**
 * List orders with filtering
 */
router.get('/', async (req, res) => {
  try {
    const { auctionRunId, customerStatus, search } = req.query;
    const query: any = {};
    
    if (auctionRunId) query.auctionRun = auctionRunId;
    if (customerStatus) query.customerStatus = customerStatus;
    
    if (search) {
      query.$or = [
        { bidderNumber: new RegExp(String(search), 'i') },
        { bookingCode: new RegExp(String(search), 'i') }
      ];
    }

    const orders = await Order.find(query)
      .populate('customer')
      .sort({ appointmentTime: 1, bidderNumber: 1 });
      
    res.json(orders);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch orders', details: error.message });
  }
});

// Resolve order ID from either Mongoose ObjectId or Booking Code
router.param('id', async (req: any, res: any, next, id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    try {
      const order = await Order.findOne({ bookingCode: id });
      if (order) {
        req.params.id = order._id.toString();
      }
    } catch (err) {
      // Pass along, will fail in the route
    }
  }
  next();
});

/**
 * Get a single order with its associated lots
 */
router.get('/:id', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('customer').populate('auctionRun');
    if (!order) return res.status(404).json({ error: 'Order not found' });
    
    const lots = await Lot.find({ order: order._id });
    
    res.json({
      ...order.toObject(),
      lots
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch order', details: error.message });
  }
});

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
      await ActivityService.log({
        type: 'Preparation',
        title: 'Order Ready',
        description: `Order for Bidder #${order.bidderNumber} marked as Ready for Pickup.`,
        order: order._id,
        auctionRun: order.auctionRun
      });
    }

    // TRIGGER: Pickup Confirmation
    if (oldOrder.customerStatus !== 'Picked Up' && customerStatus === 'Picked Up') {
      await NotificationService.send(order._id.toString(), 10, {
        date: new Date().toLocaleDateString(),
        time: new Date().toLocaleTimeString()
      }); // Type 10: Pickup Confirmation
      
      await ActivityService.log({
        type: 'Release',
        title: 'Order Released',
        description: `Order for Bidder #${order.bidderNumber} has been released to customer.`,
        order: order._id,
        auctionRun: order.auctionRun
      });
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
    const { slotId, isAdminOverride } = req.body;
    const orderId = req.params.id;

    // 1. Check if rescheduling is allowed (2-hour rule) - Skip if Admin
    const existingOrder = await Order.findById(orderId);
    if (existingOrder && existingOrder.appointmentTime && !isAdminOverride) {
      const now = new Date();
      const diffMs = existingOrder.appointmentTime.getTime() - now.getTime();
      const diffHours = diffMs / (1000 * 60 * 60);
      
      if (diffHours < 2) {
        throw new Error('Rescheduling is only allowed up to 2 hours before your appointment.');
      }
    }

    // If rescheduling, decrement old slot count
    if (existingOrder?.selectedSlot) {
      await Slot.findByIdAndUpdate(existingOrder.selectedSlot, { $inc: { currentBookings: -1 } }, { session });
    }

    // 2. Find and update new slot atomically if capacity remains
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

// Confirm Shipping Choice (Irreversible)
router.post('/:id/confirm-shipping', async (req: any, res: any) => {
  try {
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { 
        retrievalMethod: 'Shipping',
        customerStatus: 'Shipping Selected',
        isShippingConfirmed: true
      },
      { new: true }
    );
    if (!order) return res.status(404).json({ error: 'Order not found' });
    
    // Trigger shipping notification if needed
    // await NotificationService.send(order._id.toString(), 6); // Assuming 6 is Shipping Confirmation
    
    res.json(order);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;

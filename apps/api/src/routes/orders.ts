import express from 'express';
import mongoose from 'mongoose';
import Order from '../models/Order.js';
import Lot from '../models/Lot.js';
import Slot from '../models/Slot.js';
import Case from '../models/Case.js';
import Customer from '../models/Customer.js';
import Settings from '../models/Settings.js';
import { NotificationService } from '../services/NotificationService.js';
import { ActivityService } from '../services/ActivityService.js';

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
      const customers = await Customer.find({
        name: new RegExp(String(search), 'i')
      }).select('_id');
      const customerIds = customers.map(c => c._id);

      query.$or = [
        { bidderNumber: new RegExp(String(search), 'i') },
        { bookingCode: new RegExp(String(search), 'i') },
        { customer: { $in: customerIds } }
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

    const dwSetting = await Settings.findOne({ key: 'dispute_window_hours' });
    const disputeWindowHours = dwSetting ? parseInt(dwSetting.value, 10) : 24;

    const disputeDeadline = order.completeTimestamp 
      ? new Date(order.completeTimestamp.getTime() + disputeWindowHours * 60 * 60 * 1000)
      : null;
    
    res.json({
      ...order.toObject(),
      lots,
      disputeWindowHours,
      disputeDeadline
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
        customer: order.customer,
        auctionRun: order.auctionRun,
        statusBefore: oldOrder.fulfillmentStatus,
        statusAfter: 'Ready',
        user: req.headers['x-user-name'] || req.body.staffUser || 'System'
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
        customer: order.customer,
        auctionRun: order.auctionRun,
        statusBefore: oldOrder.customerStatus,
        statusAfter: 'Picked Up',
        user: req.headers['x-user-name'] || req.body.staffUser || 'System'
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
    const { slotId, isAdminOverride, authorizedPerson, staffUser } = req.body;
    const orderId = req.params.id;

    // 1. Check if rescheduling is allowed (2-hour rule) - Skip if Admin
    const existingOrder = await Order.findById(orderId);
    if (existingOrder && (existingOrder.retrievalMethod === 'Shipping' || existingOrder.isShippingConfirmed)) {
      throw new Error('This order is marked for shipping and cannot book a pickup slot.');
    }

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
        pickupStatus: 'Booked',
        lifecycleStatus: 'Awaiting Customer Action',
        appointmentTime: new Date(`${slot.date}T${slot.startTime}:00`),
        selectedSlot: slotId,
        authorizedPerson: authorizedPerson || undefined
      },
      { new: true, session }
    );

    if (!order) {
      throw new Error('Order not found');
    }

    await session.commitTransaction();

    // 3. Log Activity
    await ActivityService.log({
      type: 'Preparation',
      title: 'Order Pickup Booked',
      description: `Appointment scheduled for Bidder #${order.bidderNumber} on ${slot.date} at ${slot.startTime}.`,
      order: order._id,
      customer: order.customer,
      auctionRun: order.auctionRun,
      statusBefore: existingOrder?.customerStatus || 'Awaiting Choice',
      statusAfter: 'Booked',
      user: req.headers['x-user-name'] || staffUser || 'Customer'
    });

    // 4. Trigger Notification (Type 4: Booking Confirmation)
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
    const { staffUser } = req.body;
    const oldOrder = await Order.findById(req.params.id);
    if (!oldOrder) return res.status(404).json({ error: 'Order not found' });

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
    
    // Log Activity
    await ActivityService.log({
      type: 'Preparation',
      title: 'Shipping Option Selected',
      description: `Customer confirmed Shipping retrieval method for Bidder #${order.bidderNumber}.`,
      order: order._id,
      customer: order.customer,
      auctionRun: order.auctionRun,
      statusBefore: oldOrder.customerStatus,
      statusAfter: 'Shipping Selected',
      user: req.headers['x-user-name'] || staffUser || 'Customer'
    });

    // Trigger shipping notification if needed
    await NotificationService.send(order._id.toString(), 2);
    
    res.json(order);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Release Order with exceptions
router.post('/:id/release', async (req: any, res: any) => {
  try {
    const { releasedLotIds, withheldLots } = req.body; // withheldLots: Array<{ lotId: string, lotNumber: string, reason: string, notes?: string }>
    const orderId = req.params.id;

    const order = await Order.findById(orderId).populate('customer');
    if (!order) return res.status(404).json({ error: 'Order not found' });

    // Mark released lots as Released
    if (releasedLotIds && releasedLotIds.length > 0) {
      await Lot.updateMany(
        { _id: { $in: releasedLotIds } },
        { $set: { status: 'Ready', releaseStatus: 'Released' } }
      );

      for (const lotId of releasedLotIds) {
        await ActivityService.log({
          type: 'Release',
          title: 'Lot Released',
          description: `Lot ID ${lotId} has been successfully released.`,
          order: order._id,
          customer: order.customer?._id || order.customer,
          lot: lotId,
          auctionRun: order.auctionRun,
          statusBefore: 'Unreleased',
          statusAfter: 'Released',
          user: req.headers['x-user-name'] || req.body.staffUser || 'System'
        });
      }
    }

    // Process withheld lots and trigger case creation
    if (withheldLots && withheldLots.length > 0) {
      for (const item of withheldLots) {
        let rStatus = 'Unreleased';
        if (item.reason === 'Not Found' || item.reason === 'Missing at Release') rStatus = 'Not Found';
        else if (item.reason === 'Customer Refused') rStatus = 'Refused';
        else if (item.reason === 'Issue') rStatus = 'Refused';

        // Update lot status to withheld status
        await Lot.findByIdAndUpdate(item.lotId, {
          $set: {
            status: item.reason === 'Not Found' ? 'Not Found in Prep' : 'Hold/Issue',
            releaseStatus: rStatus
          }
        });

        await ActivityService.log({
          type: 'Release',
          title: 'Lot Withheld',
          description: `Lot ${item.lotNumber} withheld at release. Reason: ${item.reason}`,
          order: order._id,
          customer: order.customer?._id || order.customer,
          lot: item.lotId,
          auctionRun: order.auctionRun,
          statusBefore: 'Unreleased',
          statusAfter: rStatus,
          notes: item.notes || `Reason: ${item.reason}`,
          user: req.headers['x-user-name'] || req.body.staffUser || 'System'
        });

        // Map reason to case type
        let caseType: 'Missing in Prep' | 'Missing at Release' | 'Refused' | 'Issue' | 'Return' | 'Dispute' | 'Release Exception' = 'Release Exception';

        // Auto create/update case for this order
        const existingCase = await Case.findOne({ order: orderId, status: 'Open' });
        if (existingCase) {
          existingCase.lines.push({
            lotNumber: item.lotNumber,
            reason: item.reason,
            status: 'Open',
            notes: item.notes || `Lot withheld at release. Reason: ${item.reason}`
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
            type: caseType,
            status: 'Open',
            lines: [{
              lotNumber: item.lotNumber,
              reason: item.reason,
              status: 'Open',
              notes: item.notes || `Lot withheld at release. Reason: ${item.reason}`
            }]
          });
          await newCase.save();
        }
      }
    }

    // Update order status
    order.customerStatus = 'Picked Up';
    order.completeTimestamp = new Date();
    // Set appropriate lifecycle status
    if (withheldLots && withheldLots.length > 0) {
      order.pickupStatus = 'Partially Released';
      order.lifecycleStatus = 'Partially Released';
    } else {
      order.pickupStatus = 'Released';
      order.lifecycleStatus = 'Released';
    }
    await order.save();

    // TRIGGER: Pickup Confirmation (Notification Type 10)
    await NotificationService.send(orderId, 10, {
      date: new Date().toLocaleDateString(),
      time: new Date().toLocaleTimeString()
    });

    await ActivityService.log({
      type: 'Release',
      title: withheldLots && withheldLots.length > 0 ? 'Order Partially Released' : 'Order Released',
      description: `Order for Bidder #${order.bidderNumber} has been released. ${withheldLots?.length || 0} exceptions created.`,
      order: order._id,
      customer: order.customer?._id || order.customer,
      auctionRun: order.auctionRun,
      statusBefore: 'Booked', // Or checked in / ready
      statusAfter: 'Picked Up',
      user: req.headers['x-user-name'] || req.body.staffUser || 'System'
    });

    // If no open case on order: Google Review request fires (Type 12)
    const openCase = await Case.findOne({ order: orderId, status: { $ne: 'Resolved' } });
    if (!openCase) {
      await NotificationService.send(orderId, 12); // Send Google Review Request
    }

    res.json({ success: true, order });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;

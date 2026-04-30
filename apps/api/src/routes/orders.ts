import express from 'express';
import Order from '../models/Order';
import Customer from '../models/Customer';
import { NotificationService } from '../services/NotificationService';

const router = express.Router();

// Search orders (by bidder #, booking code, or customer name)
router.get('/search', async (req: any, res: any) => {
  try {
    const { q } = req.query;
    if (!q) return res.json([]);

    // Find customers matching the name first
    const customers = await Customer.find({ name: { $regex: q, $options: 'i' } });
    const customerIds = customers.map(c => c._id);

    const orders = await Order.find({
      $or: [
        { bidderNumber: { $regex: q, $options: 'i' } },
        { bookingCode: { $regex: q, $options: 'i' } },
        { customer: { $in: customerIds } }
      ]
    }).populate('customer').populate('auctionRun').limit(20);

    res.json(orders);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Check-in customer
router.patch('/:id/check-in', async (req: any, res: any) => {
  try {
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { 
        $set: { 
          customerStatus: 'Checked In',
          isCheckedIn: true,
          checkInTimestamp: new Date() // I'll add this to the model
        } 
      },
      { new: true }
    ).populate('customer');

    res.json(order);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get lots for an order
router.get('/:id/lots', async (req: any, res: any) => {
  try {
    const Lot = require('../models/Lot').default;
    const lots = await Lot.find({ order: req.params.id });
    res.json(lots);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
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

// HANDOFF: Release order to customer
router.patch('/:id/release', async (req: any, res: any) => {
  try {
    const { clerkName, lotOutcomes } = req.body; // lotOutcomes: { lotId: 'Picked Up' | 'Not Found' | 'Refused' }
    
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ error: 'Order not found' });

    // 1. Update Lot Statuses
    const Lot = require('../models/Lot').default;
    for (const [lotId, outcome] of Object.entries(lotOutcomes)) {
      await Lot.findByIdAndUpdate(lotId, { status: outcome });
    }

    // 2. Update Order
    order.customerStatus = 'Picked Up';
    order.fulfillmentStatus = 'Ready'; 
    order.clerkName = clerkName;
    order.pickupTimestamp = new Date();
    await order.save();

    // 3. TRIGGER: Pickup Confirmation (Type 10)
    await NotificationService.send(order._id.toString(), 10, {
      date: new Date().toLocaleDateString(),
      time: new Date().toLocaleTimeString()
    });

    res.json({ success: true, order });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// SEED: Create test data for Clerk Module
router.post('/seed', async (req: any, res: any) => {
  try {
    const AuctionRun = require('../models/AuctionRun').default;
    const Lot = require('../models/Lot').default;
    
    // 1. Create/Find Customer
    let customer = await Customer.findOne({ email: 'test@example.com' });
    if (!customer) {
      customer = await Customer.create({
        name: 'Test Customer',
        email: 'test@example.com',
        phone: '555-0199',
        bidderNumber: '888'
      });
    }

    // 2. Create Auction Run if none
    let auction = await AuctionRun.findOne({ auctionNumber: '31' });
    if (!auction) {
      auction = await AuctionRun.create({
        auctionNumber: '31',
        title: 'Weekly Auction #31',
        status: 'Active'
      });
    }

    // 3. Create Order
    const order = await Order.create({
      customer: customer._id,
      auctionRun: auction._id,
      bidderNumber: '888',
      bookingCode: 'BOK-TEST-777',
      fulfillmentStatus: 'Ready',
      customerStatus: 'Pending',
      appointmentTime: new Date()
    });

    // 4. Create Lots
    await Lot.create([
      { order: order._id, auctionRun: auction._id, lotNumber: '101', description: 'Samsung 65" 4K TV', finalPickupLocation: 'BIN-A1', type: 'Non-Sort', status: 'Ready' },
      { order: order._id, auctionRun: auction._id, lotNumber: '102', description: 'KitchenAid Mixer', finalPickupLocation: 'BIN-A1', type: 'Sort', status: 'Ready' },
      { order: order._id, auctionRun: auction._id, lotNumber: '103', description: 'Apple iPad Pro', finalPickupLocation: 'PU-05', type: 'Non-Sort', status: 'Ready' }
    ]);

    res.json({ success: true, orderId: order._id });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;

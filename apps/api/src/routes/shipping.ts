import express from 'express';
import Order from '../models/Order';
import Parcel from '../models/Parcel';
import Lot from '../models/Lot';
import { ShippingService } from '../services/ShippingService';
import { NotificationService } from '../services/NotificationService';
import { ActivityService } from '../services/ActivityService';

const router = express.Router();

// Get shipping queue (In Queue status)
router.get('/queue', async (req, res) => {
  try {
    const { auctionRunId } = req.query;
    const query: any = { 
      retrievalMethod: 'Shipping',
      shippingStatus: { $in: ['Shipping Selected', 'In Shipping Queue', 'Packing In Progress'] }
    };
    if (auctionRunId) {
      query.auctionRun = auctionRunId;
    }
    const orders = await Order.find(query).populate('customer').populate('auctionRun');
    res.json(orders);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Get prepared shipping
router.get('/prepared', async (req, res) => {
  try {
    const { auctionRunId } = req.query;
    const query: any = { 
      retrievalMethod: 'Shipping',
      shippingStatus: { $in: ['Ready for Rating', 'Awaiting AF360 Charge', 'Awaiting Payment', 'Payment Confirmed', 'Label Ready'] }
    };
    if (auctionRunId) {
      query.auctionRun = auctionRunId;
    }
    const orders = await Order.find(query).populate('customer').populate('auctionRun');
    res.json(orders);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Get dispatched shipping
router.get('/dispatched', async (req, res) => {
  try {
    const { auctionRunId } = req.query;
    const query: any = { 
      retrievalMethod: 'Shipping',
      shippingStatus: 'Dispatched'
    };
    if (auctionRunId) {
      query.auctionRun = auctionRunId;
    }
    const orders = await Order.find(query).sort({ shippedAt: -1 }).limit(100).populate('customer').populate('auctionRun');
    res.json(orders);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Get parcels for an order
router.get('/orders/:orderId/parcels', async (req, res) => {
  try {
    const parcels = await Parcel.find({ order: req.params.orderId }).populate('lots');
    res.json(parcels);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Create a parcel for an order
router.post('/orders/:orderId/parcels', async (req, res) => {
  try {
    const { lots, dimensions, packingDetails, sequenceNumber } = req.body;
    const orderId = req.params.orderId;

    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ error: 'Order not found' });

    // Validate that lots belong to this order
    const validLots = await Lot.find({ _id: { $in: lots }, order: orderId });
    if (validLots.length !== lots.length) {
      return res.status(400).json({ error: 'One or more lot IDs are invalid or do not belong to this order.' });
    }

    const parcel = new Parcel({
      order: orderId,
      lots,
      dimensions: dimensions || { length: 0, width: 0, height: 0, weight: 0 },
      packingDetails: packingDetails || '',
      sequenceNumber: sequenceNumber || 1,
      status: 'In Queue'
    });

    await parcel.save();

    // Trigger mock rate retrieval immediately
    const mockRates = await ShippingService.getAllRates(parcel.dimensions);
    parcel.rates = mockRates;
    await parcel.save();

    await ActivityService.log({
      type: 'Preparation',
      title: 'Parcel Created',
      description: `Parcel #${parcel.sequenceNumber} created for Bidder #${order.bidderNumber} containing ${lots.length} lots.`,
      order: order._id,
      auctionRun: order.auctionRun
    });

    res.status(201).json(parcel);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get rates for a parcel (refetch/fetch)
router.get('/parcels/:parcelId/rates', async (req, res) => {
  try {
    const parcel = await Parcel.findById(req.params.parcelId);
    if (!parcel) return res.status(404).json({ error: 'Parcel not found' });

    const mockRates = await ShippingService.getAllRates(parcel.dimensions);
    parcel.rates = mockRates;
    await parcel.save();

    res.json(mockRates);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Select rate for a parcel
router.post('/parcels/:parcelId/select-rate', async (req, res) => {
  try {
    const { rateId, manualOverrideCharge } = req.body;
    const parcel = await Parcel.findById(req.params.parcelId);
    if (!parcel) return res.status(404).json({ error: 'Parcel not found' });

    const selectedRate = parcel.rates.find(r => r.id === rateId || r._id?.toString() === rateId);
    if (!selectedRate) return res.status(400).json({ error: 'Selected rate not found' });

    parcel.selectedRateId = rateId;
    if (manualOverrideCharge !== undefined && manualOverrideCharge !== null) {
      selectedRate.customerCharge = manualOverrideCharge;
    }
    
    parcel.status = 'Awaiting Payment';
    await parcel.save();

    // Also update order status to Awaiting AF360 or Awaiting Payment
    const order = await Order.findById(parcel.order);
    if (order && (order.shippingStatus === 'Shipping Selected' || order.shippingStatus === 'In Shipping Queue')) {
      order.shippingStatus = 'Awaiting AF360 Charge';
      await order.save();
    }

    res.json(parcel);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Delete a parcel
router.delete('/parcels/:parcelId', async (req, res) => {
  try {
    const parcel = await Parcel.findByIdAndDelete(req.params.parcelId);
    if (!parcel) return res.status(404).json({ error: 'Parcel not found' });

    res.json({ message: 'Parcel deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Toggle AF360 billing confirmation for an order
router.patch('/orders/:orderId/af360', async (req, res) => {
  try {
    const { addedToAF360 } = req.body;
    const order = await Order.findById(req.params.orderId);
    if (!order) return res.status(404).json({ error: 'Order not found' });

    order.addedToAF360 = addedToAF360;
    if (addedToAF360) {
      order.shippingStatus = 'Awaiting Payment';
    }
    await order.save();

    await ActivityService.log({
      type: 'System',
      title: 'AF360 Sync Confirmed',
      description: `Shipping charge for Bidder #${order.bidderNumber} confirmed as added in AuctionFlex360.`,
      order: order._id,
      auctionRun: order.auctionRun
    });

    res.json(order);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Progress shipping status of an order
router.patch('/orders/:orderId/status', async (req, res) => {
  try {
    const { shippingStatus, trackingNumber } = req.body;
    const order = await Order.findById(req.params.orderId);
    if (!order) return res.status(404).json({ error: 'Order not found' });

    const prevStatus = order.shippingStatus;
    order.shippingStatus = shippingStatus as any;

    if (shippingStatus === 'Dispatched') {
      order.trackingNumber = trackingNumber || order.trackingNumber;
      order.shippedAt = new Date();
      order.customerStatus = 'Picked Up'; // Or a separate shipping status equivalent
      
      // TRIGGER: Tracking Sent (Type 13)
      if (order.trackingNumber) {
        await NotificationService.send(order._id.toString(), 13, {
          trackingNumber: order.trackingNumber
        });
      }
    }

    await order.save();

    await ActivityService.log({
      type: 'Preparation',
      title: `Shipping Status: ${shippingStatus}`,
      description: `Order for Bidder #${order.bidderNumber} moved from ${prevStatus} to ${shippingStatus}.`,
      order: order._id,
      auctionRun: order.auctionRun
    });

    res.json(order);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Kept legacy endpoint for compatibility if needed
router.patch('/:id/prepare', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    order.shippingStatus = 'Ready for Rating';
    await order.save();

    res.json(order);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

router.patch('/:id/dispatch', async (req, res) => {
  try {
    const { trackingNumber } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    order.shippingStatus = 'Dispatched';
    order.trackingNumber = trackingNumber;
    order.shippedAt = new Date();
    await order.save();

    await NotificationService.send(order._id.toString(), 13, {
      trackingNumber
    });

    res.json(order);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

export default router;

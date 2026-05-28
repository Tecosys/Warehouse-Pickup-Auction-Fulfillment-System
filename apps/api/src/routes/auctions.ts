import express from 'express';
import AuctionRun from '../models/AuctionRun';
import Order from '../models/Order';
import Notification from '../models/Notification';
import Case from '../models/Case';
import Lot from '../models/Lot';
import Settings from '../models/Settings';
import Credit from '../models/Credit';
import { ActivityService } from '../services/ActivityService';

const router = express.Router();

/**
 * Get all auction runs
 */
router.get('/', async (req, res) => {
  try {
    const auctions = await AuctionRun.find().sort({ importedDate: -1 });
    res.json(auctions);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch auctions', details: error.message });
  }
});

/**
 * Get the active (most recent) auction run
 */
router.get('/active', async (req, res) => {
  try {
    const auction = await AuctionRun.findOne().sort({ importedDate: -1 });
    if (!auction) return res.status(404).json({ error: 'No auction runs found' });
    res.json(auction);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch active auction', details: error.message });
  }
});

/**
 * Get full dashboard stats for the active auction run
 */
router.get('/dashboard-stats', async (req: any, res: any) => {
  try {
    const { auctionRunId } = req.query;
    let auction;
    
    if (auctionRunId) {
      auction = await AuctionRun.findById(auctionRunId);
    } else {
      auction = await AuctionRun.findOne().sort({ importedDate: -1 });
    }
    
    if (!auction) return res.json({ empty: true });

    const runId = auction._id;

    // Fulfillment status breakdown
    const [totalOrders, notStarted, inProgress, ready] = await Promise.all([
      Order.countDocuments({ auctionRun: runId }),
      Order.countDocuments({ auctionRun: runId, fulfillmentStatus: 'Not Started' }),
      Order.countDocuments({ auctionRun: runId, fulfillmentStatus: 'In Progress' }),
      Order.countDocuments({ auctionRun: runId, fulfillmentStatus: 'Ready' }),
    ]);

    // Customer lifecycle breakdown
    const [awaitingChoice, booked, checkedIn, pickedUp, partiallyPickedUp, cancelled, shippingSelected] = await Promise.all([
      Order.countDocuments({ auctionRun: runId, customerStatus: 'Awaiting Choice' }),
      Order.countDocuments({ auctionRun: runId, customerStatus: 'Booked' }),
      Order.countDocuments({ auctionRun: runId, customerStatus: 'Checked In' }),
      Order.countDocuments({ auctionRun: runId, customerStatus: 'Picked Up' }),
      Order.countDocuments({ auctionRun: runId, customerStatus: 'Partially Picked Up' }),
      Order.countDocuments({ auctionRun: runId, customerStatus: 'Cancelled' }),
      Order.countDocuments({ auctionRun: runId, customerStatus: 'Shipping Selected' }),
    ]);

    // Upcoming appointments (next 5 booked with a time slot)
    const upcomingAppointments = await Order.find({
      auctionRun: runId,
      customerStatus: 'Booked',
      appointmentTime: { $gte: new Date() }
    })
      .populate('customer')
      .sort({ appointmentTime: 1 })
      .limit(5);

    // Recent notification activity
    const recentNotifications = await Notification.find()
      .populate('customer')
      .sort({ createdAt: -1 })
      .limit(10);

    res.json({
      auction: {
        _id: auction._id,
        title: auction.title,
        auctionNumber: auction.auctionNumber,
        importedDate: auction.importedDate,
      },
      fulfillment: { totalOrders, notStarted, inProgress, ready },
      lifecycle: { awaitingChoice, booked, checkedIn, pickedUp, partiallyPickedUp, cancelled, shippingSelected },
      upcomingAppointments: upcomingAppointments.map(o => ({
        _id: o._id,
        bidderNumber: o.bidderNumber,
        customerName: (o as any).customer?.name || `Bidder #${o.bidderNumber}`,
        appointmentTime: o.appointmentTime,
        fulfillmentStatus: o.fulfillmentStatus,
      })),
      recentNotifications: recentNotifications.map(n => ({
        _id: n._id,
        type: (n as any).type,
        customerName: (n as any).customer?.name || 'Unknown',
        status: (n as any).status,
        createdAt: (n as any).createdAt,
      })),
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch dashboard stats', details: error.message });
  }
});

/**
 * Get stats for a specific auction run
 */
router.get('/:id/stats', async (req, res) => {
  try {
    const auction = await AuctionRun.findById(req.params.id);
    if (!auction) return res.status(404).json({ error: 'Auction run not found' });
    
    const totalOrders = await Order.countDocuments({ auctionRun: auction._id });
    const readyCount = await Order.countDocuments({ auctionRun: auction._id, fulfillmentStatus: 'Ready' });
    
    res.json({
      ...auction.stats,
      totalOrders,
      readyCount
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch auction stats', details: error.message });
  }
});

// Closeout summary
router.get('/:id/closeout-summary', async (req: any, res: any) => {
  try {
    const runId = req.params.id;
    const auction = await AuctionRun.findById(runId);
    if (!auction) return res.status(404).json({ error: 'Auction run not found' });

    const [
      unreleasedCount,
      unpaidCount,
      openShippingCount,
      openCasesCount,
      returnsCount,
      activeCreditsCount
    ] = await Promise.all([
      Order.countDocuments({ auctionRun: runId, customerStatus: { $nin: ['Picked Up', 'Cancelled'] } }),
      Order.countDocuments({ auctionRun: runId, paymentStatus: { $ne: 'Paid' }, customerStatus: { $ne: 'Cancelled' } }),
      Order.countDocuments({ auctionRun: runId, retrievalMethod: 'Shipping', shippingStatus: { $ne: 'Dispatched' }, customerStatus: { $ne: 'Cancelled' } }),
      Case.countDocuments({ auctionRun: runId, status: { $ne: 'Resolved' } }),
      Lot.countDocuments({ auctionRun: runId, status: 'Return Received' }),
      Credit.countDocuments({ status: { $in: ['Active', 'Partially Used'] } })
    ]);

    const restockingPercentSetting = await Settings.findOne({ key: 'restocking_fee_percent' });
    const restockingFlatSetting = await Settings.findOne({ key: 'restocking_fee_flat' });

    res.json({
      readyForBooks: auction.readyForBooks || false,
      unreleasedCount,
      unpaidCount,
      openShippingCount,
      openCasesCount,
      returnsCount,
      activeCreditsCount,
      restockingPercent: restockingPercentSetting ? parseFloat(restockingPercentSetting.value) : 10,
      restockingFlat: restockingFlatSetting ? parseFloat(restockingFlatSetting.value) : 50
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch closeout summary', details: error.message });
  }
});

// Closeout execution
router.post('/:id/closeout', async (req: any, res: any) => {
  try {
    const runId = req.params.id;
    const auction = await AuctionRun.findById(runId);
    if (!auction) return res.status(404).json({ error: 'Auction run not found' });

    // Fetch restocking policy config
    const restockingPercentSetting = await Settings.findOne({ key: 'restocking_fee_percent' });
    const restockingFlatSetting = await Settings.findOne({ key: 'restocking_fee_flat' });
    const pct = restockingPercentSetting ? parseFloat(restockingPercentSetting.value) : 10;
    const flat = restockingFlatSetting ? parseFloat(restockingFlatSetting.value) : 50;

    // Fetch unpicked/unpaid orders to abandon/cancel
    const abandonedOrders = await Order.find({
      auctionRun: runId,
      customerStatus: { $nin: ['Picked Up', 'Cancelled'] }
    });

    for (const order of abandonedOrders) {
      const orderTotal = (order.totalHammer || 0) + (order.buyerPremium || 0) + (order.handlingFee || 0) + (order.taxAmount || 0);
      const fee = Math.max(orderTotal * (pct / 100), flat);
      
      // Update order to Cancelled
      order.customerStatus = 'Cancelled';
      order.lifecycleStatus = 'Cancelled';
      await order.save();

      // Set associated lots' status back to 'Hold/Issue' (so they can be re-listed)
      await Lot.updateMany({ order: order._id }, { $set: { status: 'Hold/Issue', releaseStatus: 'Unreleased' } });

      // Log the activity
      await ActivityService.log({
        type: 'System',
        title: 'Order Abandoned & Restocked',
        description: `Order for Bidder #${order.bidderNumber} cancelled due to closeout abandonment. Restocking fee of $${fee.toFixed(2)} applied.`,
        order: order._id,
        customer: order.customer,
        auctionRun: runId,
        statusBefore: 'Booked',
        statusAfter: 'Cancelled',
        notes: `Restocking fee calculated: Math.max(${orderTotal} * ${pct}%, ${flat}) = $${fee.toFixed(2)}`,
        user: req.headers['x-user-name'] || req.body.staffUser || 'System'
      });
    }

    // Set readyForBooks to true
    auction.readyForBooks = true;
    await auction.save();

    // Log the closeout event
    await ActivityService.log({
      type: 'System',
      title: 'Auction Run Closed',
      description: `Auction Run ${auction.title} (Run #${auction.auctionNumber}) marked as Ready for Books.`,
      auctionRun: runId,
      user: req.headers['x-user-name'] || req.body.staffUser || 'System'
    });

    res.json({ success: true, message: `Auction closeout successful. ${abandonedOrders.length} orders restocked.` });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to complete closeout', details: error.message });
  }
});

export default router;


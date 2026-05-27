import express from 'express';
import AuctionRun from '../models/AuctionRun';
import Order from '../models/Order';
import Notification from '../models/Notification';

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

export default router;


import express from 'express';
import Lot from '../models/Lot';

const router = express.Router();

// GET /api/lots/search — Search lots by lot number or bidder number
router.get('/search', async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) return res.json([]);

    const lots = await Lot.find({
      $or: [
        { lotNumber: q },
        { bidderNumber: q }
      ]
    }).populate('auctionRun').limit(10);
    
    res.json(lots);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// PATCH /api/lots/:id — Update lot status and/or pickup location
router.patch('/:id', async (req: any, res: any) => {
  try {
    const { status, finalPickupLocation } = req.body;
    const update: any = {};
    if (status !== undefined) update.status = status;
    if (finalPickupLocation !== undefined) update.finalPickupLocation = finalPickupLocation;

    const lot = await Lot.findByIdAndUpdate(req.params.id, { $set: update }, { new: true });
    if (!lot) return res.status(404).json({ error: 'Lot not found' });
    res.json(lot);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;

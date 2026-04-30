import express from 'express';
import Slot from '../models/Slot';
import Order from '../models/Order';

const router = express.Router();

// Get available slots for an auction run
router.get('/available/:auctionRunId', async (req: any, res: any) => {
  try {
    const slots = await Slot.find({ 
      auctionRun: req.params.auctionRunId,
    }).sort({ date: 1, startTime: 1 });
    
    // Return only slots that aren't full
    const available = slots.filter(s => s.currentBookings < s.maxCapacity);
    res.json(available);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Initialize weekly slots (Admin Action)
router.post('/initialize', async (req: any, res: any) => {
  try {
    const { auctionRunId, dates, config } = req.body; 
    // config example: { start: '10:00', end: '16:00', interval: 15, capacity: 5 }
    
    const slotsToCreate = [];
    for (const date of dates) {
      let current = config.start;
      while (current < config.end) {
        // Simple increment logic
        const [h, m] = current.split(':').map(Number);
        let nextM = m + config.interval;
        let nextH = h;
        if (nextM >= 60) { nextH++; nextM -= 60; }
        const next = `${String(nextH).padStart(2, '0')}:${String(nextM).padStart(2, '0')}`;
        
        slotsToCreate.push({
          auctionRun: auctionRunId,
          date,
          startTime: current,
          endTime: next,
          maxCapacity: config.capacity
        });
        current = next;
      }
    }

    await Slot.insertMany(slotsToCreate, { ordered: false }).catch(() => {}); // Ignore duplicates
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Clone slots from a previous auction run
router.post('/clone', async (req: any, res: any) => {
  try {
    const { fromAuctionRunId, toAuctionRunId, newDates } = req.body;
    
    // 1. Get original slots
    const originalSlots = await Slot.find({ auctionRun: fromAuctionRunId }).sort({ date: 1, startTime: 1 });
    if (originalSlots.length === 0) throw new Error('No slots found to clone');

    // 2. Map original slots to new dates
    // Assuming the number of unique dates in original match the newDates array
    const originalDates = [...new Set(originalSlots.map(s => s.date))].sort();
    
    const slotsToCreate = [];
    for (let i = 0; i < newDates.length; i++) {
      const newDate = newDates[i];
      const matchingSlots = originalSlots.filter(s => s.date === originalDates[i % originalDates.length]);
      
      for (const s of matchingSlots) {
        slotsToCreate.push({
          auctionRun: toAuctionRunId,
          date: newDate,
          startTime: s.startTime,
          endTime: s.endTime,
          maxCapacity: s.maxCapacity
        });
      }
    }

    await Slot.insertMany(slotsToCreate, { ordered: false }).catch(() => {});
    res.json({ success: true, count: slotsToCreate.length });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;

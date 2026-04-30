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

export default router;

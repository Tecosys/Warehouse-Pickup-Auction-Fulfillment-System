import express from 'express';
import mongoose from 'mongoose';
import Slot from '../models/Slot';
import Order from '../models/Order';
import { NotificationService } from '../services/NotificationService';

const router = express.Router();

// ─── Get ALL slots for an auction run (Admin view — includes full slots) ───────
router.get('/all/:auctionRunId', async (req: any, res: any) => {
  try {
    const slots = await Slot.find({ auctionRun: req.params.auctionRunId })
      .sort({ date: 1, startTime: 1 });
    res.json(slots);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ─── Get available slots for an auction run (Customer view — excludes full & past) ───
router.get('/available/:auctionRunId', async (req: any, res: any) => {
  try {
    const slots = await Slot.find({ auctionRun: req.params.auctionRunId })
      .sort({ date: 1, startTime: 1 });
    
    const nowTorontoStr = new Date().toLocaleString('en-US', { timeZone: 'America/Toronto' });
    const nowToronto = new Date(nowTorontoStr);

    const available = slots.filter(s => {
      if (s.currentBookings >= s.maxCapacity) return false;
      try {
        const [year, month, day] = (s.date || '').split('-').map(Number);
        const [hour, minute] = (s.startTime || '').split(':').map(Number);
        const slotDate = new Date(year || 0, (month || 1) - 1, day || 1, hour || 0, minute || 0);
        return slotDate > nowToronto;
      } catch (e) {
        return true;
      }
    });
    res.json(available);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ─── Get bookings for a specific slot (who is booked in that slot) ────────────
router.get('/:slotId/bookings', async (req: any, res: any) => {
  try {
    const orders = await Order.find({ selectedSlot: req.params.slotId })
      .populate('customer')
      .select('bidderNumber bookingCode customerStatus fulfillmentStatus appointmentTime customer');
    res.json(orders);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ─── Update a slot (capacity, date, time) — Admin Only ────────────────────────
router.patch('/:id', async (req: any, res: any) => {
  try {
    const slot = await Slot.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );
    if (!slot) return res.status(404).json({ error: 'Slot not found' });
    res.json(slot);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ─── Delete a slot — Admin Only ───────────────────────────────────────────────
router.delete('/:id', async (req: any, res: any) => {
  try {
    // Safety check: don't delete a slot with active bookings
    const slot = await Slot.findById(req.params.id);
    if (!slot) return res.status(404).json({ error: 'Slot not found' });
    if (slot.currentBookings > 0) {
      return res.status(400).json({ error: `Cannot delete: ${slot.currentBookings} customer(s) already booked in this slot.` });
    }
    await slot.deleteOne();
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ─── Admin: Reschedule an order to a different slot ───────────────────────────
router.post('/reschedule', async (req: any, res: any) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { orderId, newSlotId } = req.body;
    if (!orderId || !newSlotId) return res.status(400).json({ error: 'orderId and newSlotId are required' });

    const order = await Order.findById(orderId).session(session);
    if (!order) throw new Error('Order not found');

    // Decrement old slot if one was booked
    if (order.selectedSlot) {
      await Slot.findByIdAndUpdate(
        order.selectedSlot,
        { $inc: { currentBookings: -1 } },
        { session }
      );
    }

    // Atomically claim capacity in new slot
    const newSlot = await Slot.findOneAndUpdate(
      { _id: newSlotId, $expr: { $lt: ['$currentBookings', '$maxCapacity'] } },
      { $inc: { currentBookings: 1 } },
      { new: true, session }
    );
    if (!newSlot) throw new Error('New slot is full or does not exist');

    // Update order
    const updated = await Order.findByIdAndUpdate(
      orderId,
      {
        selectedSlot: newSlotId,
        appointmentTime: new Date(`${newSlot.date}T${newSlot.startTime}:00Z`),
        customerStatus: 'Booked',
        pickupStatus: 'Booked',
        lifecycleStatus: 'Awaiting Customer Action'
      },
      { new: true, session }
    );

    await session.commitTransaction();

    // Send notification (Type 4: Booking Confirmation)
    await NotificationService.send(orderId, 4, {
      date: newSlot.date,
      time: newSlot.startTime
    }).catch(() => {});

    res.json({ success: true, order: updated, slot: newSlot });
  } catch (error: any) {
    await session.abortTransaction();
    res.status(400).json({ error: error.message });
  } finally {
    session.endSession();
  }
});

// ─── Admin: Manually book an order into a slot (override) ────────────────────
router.post('/admin-book', async (req: any, res: any) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { orderId, slotId } = req.body;
    if (!orderId || !slotId) return res.status(400).json({ error: 'orderId and slotId are required' });

    const slot = await Slot.findOneAndUpdate(
      { _id: slotId, $expr: { $lt: ['$currentBookings', '$maxCapacity'] } },
      { $inc: { currentBookings: 1 } },
      { new: true, session }
    );
    if (!slot) throw new Error('Slot is full or does not exist');

    const order = await Order.findByIdAndUpdate(
      orderId,
      {
        selectedSlot: slotId,
        appointmentTime: new Date(`${slot.date}T${slot.startTime}:00Z`),
        customerStatus: 'Booked',
        pickupStatus: 'Booked',
        lifecycleStatus: 'Awaiting Customer Action'
      },
      { new: true, session }
    );

    await session.commitTransaction();
    res.json({ success: true, order, slot });
  } catch (error: any) {
    await session.abortTransaction();
    res.status(400).json({ error: error.message });
  } finally {
    session.endSession();
  }
});

// ─── Initialize weekly slots (Admin) ──────────────────────────────────────────
router.post('/initialize', async (req: any, res: any) => {
  try {
    const { auctionRunId, dates, config } = req.body;
    // config: { start: '10:00', end: '16:00', interval: 15, capacity: 5 }

    const slotsToCreate = [];
    for (const date of dates) {
      let current = config.start;
      while (current < config.end) {
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
          maxCapacity: config.capacity,
          currentBookings: 0
        });
        current = next;
      }
    }
    await Slot.insertMany(slotsToCreate, { ordered: false }).catch(() => {});
    res.json({ success: true, created: slotsToCreate.length });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ─── Clone slots from a previous auction run ──────────────────────────────────
router.post('/clone', async (req: any, res: any) => {
  try {
    const { fromAuctionRunId, toAuctionRunId, newDates } = req.body;
    const originalSlots = await Slot.find({ auctionRun: fromAuctionRunId }).sort({ date: 1, startTime: 1 });
    if (originalSlots.length === 0) throw new Error('No slots found to clone');

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
          maxCapacity: s.maxCapacity,
          currentBookings: 0
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


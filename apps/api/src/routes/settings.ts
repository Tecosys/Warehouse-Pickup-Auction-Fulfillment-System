import express from 'express';
import Settings from '../models/Settings';

const router = express.Router();

const DEFAULTS = {
  buyer_premium: 0.15,
  tax_rate: 0.13,
  dispute_window_hours: 24,
  credit_expiry_months: 12,
  google_review_link: "https://g.page/r/bidboss/review"
};

// Get settings
router.get('/', async (req, res) => {
  try {
    const dbSettings = await Settings.find();
    const settingsMap = new Map();
    dbSettings.forEach(s => {
      settingsMap.set(s.key, s.value);
    });

    const result: any = {};
    for (const [key, defaultValue] of Object.entries(DEFAULTS)) {
      result[key] = settingsMap.has(key) ? settingsMap.get(key) : defaultValue;
    }
    
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Update settings
router.post('/', async (req, res) => {
  try {
    const updates = req.body;
    for (const [key, value] of Object.entries(updates)) {
      await Settings.findOneAndUpdate(
        { key },
        { value },
        { upsert: true, new: true }
      );
    }
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;

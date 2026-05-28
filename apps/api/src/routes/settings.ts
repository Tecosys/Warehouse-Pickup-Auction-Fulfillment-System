import express from 'express';
import Settings from '../models/Settings';

const router = express.Router();

const DEFAULTS = {
  buyer_premium: 0.15,
  tax_rate: 0.13,
  dispute_window_hours: 24,
  credit_expiry_months: 12,
  google_review_link: "https://g.page/r/bidboss/review",
  shipping_spread_parcel_pct: 50,
  shipping_spread_parcel_min: 8,
  shipping_fee_parcel: 5,
  shipping_spread_mailer_pct: 40,
  shipping_spread_mailer_min: 5,
  shipping_fee_mailer: 2,
  shipping_spread_pallet_pct: 18,
  shipping_spread_pallet_min: 75,
  shipping_fee_pallet: 50,
  restocking_fee_percent: 10,
  restocking_fee_flat: 50,
  pickup_reschedule_limit_hours: 2,
  risk_high_value_threshold: 300,
  risk_complaint_ratio_limit: 25,
  dispute_eligible_grades: "A,B",
  twilio_sender_number: "+15551234567",
  support_email: "support@bidbossinc.ca",
  company_name: "Bid Boss Inc.",
  customer_portal_pickup_rules: "Please pick up your won items during your booked slot.",
  customer_portal_shipping_agreement: "Shipping selection is binding. Pickups will not be allowed once shipping is confirmed."
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

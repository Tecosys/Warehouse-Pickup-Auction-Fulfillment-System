import express from 'express';
import Credit from '../models/Credit';
import Customer from '../models/Customer';

const router = express.Router();

// GET /api/credits — List all credits with optional customer filter
router.get('/', async (req, res) => {
  try {
    const { customerId } = req.query;
    const query: any = {};
    if (customerId) query.customer = customerId;

    const credits = await Credit.find(query)
      .populate('customer', 'name bidderNumber email')
      .populate('sourceCase', 'caseNumber type')
      .sort({ createdAt: -1 });

    res.json(credits);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/credits — Issue credit manually
router.post('/', async (req, res) => {
  try {
    const { bidderNumber, amount, reason, expiryDate } = req.body;
    
    const customer = await Customer.findOne({ bidderNumber });
    if (!customer) return res.status(404).json({ error: 'Customer not found' });

    const newCredit = new Credit({
      customer: customer._id,
      amount,
      reason,
      expiryDate: expiryDate ? new Date(expiryDate) : undefined,
      remainingBalance: amount,
      createdBy: 'Staff'
    });
    await newCredit.save();

    // Increment customer balance
    customer.creditBalance = (customer.creditBalance || 0) + amount;
    await customer.save();

    res.status(201).json(newCredit);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;

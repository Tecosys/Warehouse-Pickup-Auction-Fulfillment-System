import express from 'express';
import { ActivityService } from '../services/ActivityService';

const router = express.Router();

router.get('/recent', async (req, res) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 20;
    const activities = await ActivityService.getRecent(limit);
    res.json(activities);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

export default router;

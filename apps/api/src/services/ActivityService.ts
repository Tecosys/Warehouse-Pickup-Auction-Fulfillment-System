import mongoose from 'mongoose';
import Activity from '../models/Activity';

export class ActivityService {
  static async log(data: {
    type: 'Import' | 'Notification' | 'Preparation' | 'Release' | 'Return' | 'System';
    title: string;
    description: string;
    auctionRun?: string | mongoose.Types.ObjectId;
    order?: string | mongoose.Types.ObjectId;
    customer?: string | mongoose.Types.ObjectId;
    lot?: string | mongoose.Types.ObjectId;
    shipmentUnit?: string | mongoose.Types.ObjectId;
    statusBefore?: string;
    statusAfter?: string;
    notes?: string;
    user?: string;
    metadata?: Record<string, any>;
  }) {
    try {
      const activity = new Activity(data);
      await activity.save();
      return activity;
    } catch (error) {
      console.error('[Activity Service] Failed to log activity:', error);
    }
  }

  static async getRecent(limit = 20) {
    return Activity.find()
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate('auctionRun')
      .populate('order');
  }
}

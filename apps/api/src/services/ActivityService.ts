import Activity from '../models/Activity';

export class ActivityService {
  static async log(data: {
    type: 'Import' | 'Notification' | 'Preparation' | 'Release' | 'Return' | 'System';
    title: string;
    description: string;
    auctionRun?: string;
    order?: string;
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

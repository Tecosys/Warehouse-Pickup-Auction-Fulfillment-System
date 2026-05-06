import mongoose, { Schema, Document } from 'mongoose';

export interface IActivity extends Document {
  type: 'Import' | 'Notification' | 'Preparation' | 'Release' | 'Return' | 'System';
  title: string;
  description: string;
  auctionRun?: mongoose.Types.ObjectId;
  order?: mongoose.Types.ObjectId;
  user?: string;
  metadata?: Record<string, any>;
  createdAt: Date;
}

const ActivitySchema: Schema = new Schema({
  type: { 
    type: String, 
    enum: ['Import', 'Notification', 'Preparation', 'Release', 'Return', 'System'],
    required: true 
  },
  title: { type: String, required: true },
  description: { type: String },
  auctionRun: { type: Schema.Types.ObjectId, ref: 'AuctionRun' },
  order: { type: Schema.Types.ObjectId, ref: 'Order' },
  user: { type: String },
  metadata: { type: Schema.Types.Mixed, default: {} }
}, { timestamps: true });

export default mongoose.model<IActivity>('Activity', ActivitySchema);

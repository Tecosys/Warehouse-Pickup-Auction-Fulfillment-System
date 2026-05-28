import mongoose, { Schema, Document } from 'mongoose';

export interface IActivity extends Document {
  type: 'Import' | 'Notification' | 'Preparation' | 'Release' | 'Return' | 'System';
  title: string;
  description: string;
  auctionRun?: mongoose.Types.ObjectId;
  order?: mongoose.Types.ObjectId;
  customer?: mongoose.Types.ObjectId;
  lot?: mongoose.Types.ObjectId;
  shipmentUnit?: mongoose.Types.ObjectId;
  statusBefore?: string;
  statusAfter?: string;
  notes?: string;
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
  customer: { type: Schema.Types.ObjectId, ref: 'Customer' },
  lot: { type: Schema.Types.ObjectId, ref: 'Lot' },
  shipmentUnit: { type: Schema.Types.ObjectId, ref: 'Parcel' },
  statusBefore: { type: String },
  statusAfter: { type: String },
  notes: { type: String },
  user: { type: String },
  metadata: { type: Schema.Types.Mixed, default: {} }
}, { timestamps: true });

export default mongoose.model<IActivity>('Activity', ActivitySchema);

import mongoose, { Schema, Document } from 'mongoose';

export interface INotification extends Document {
  order: mongoose.Types.ObjectId;
  customer: mongoose.Types.ObjectId;
  case?: mongoose.Types.ObjectId;
  type: number; // 1 to 13
  name: string;
  channel: 'SMS' | 'Email' | 'Both';
  content: string;
  status: 'Pending' | 'Sent' | 'Failed';
  sentAt?: Date;
  error?: string;
  providerMessageId?: string;
  variablesUsed?: Record<string, any>;
}

const NotificationSchema: Schema = new Schema({
  order: { type: Schema.Types.ObjectId, ref: 'Order', required: true },
  customer: { type: Schema.Types.ObjectId, ref: 'Customer', required: true },
  case: { type: Schema.Types.ObjectId, ref: 'Case' },
  type: { type: Number, required: true },
  name: { type: String, required: true },
  channel: { type: String, enum: ['SMS', 'Email', 'Both'], default: 'Both' },
  content: { type: String, required: true },
  status: { type: String, enum: ['Pending', 'Sent', 'Failed'], default: 'Pending' },
  sentAt: { type: Date },
  error: { type: String },
  providerMessageId: { type: String },
  variablesUsed: { type: Schema.Types.Mixed, default: {} }
}, { timestamps: true });

export default mongoose.model<INotification>('Notification', NotificationSchema);

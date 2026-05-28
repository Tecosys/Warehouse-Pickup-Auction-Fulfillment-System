import mongoose, { Schema, Document } from 'mongoose';

export interface INotificationTemplate extends Document {
  templateId: number;
  name: string;
  channel: 'SMS' | 'Email' | 'Both';
  smsText: string;
  emailSubject: string;
  emailBody: string;
  isEnabled: boolean;
  variables: string[];
}

const NotificationTemplateSchema: Schema = new Schema({
  templateId: { type: Number, required: true, unique: true },
  name: { type: String, required: true },
  channel: { type: String, enum: ['SMS', 'Email', 'Both'], default: 'Both' },
  smsText: { type: String, default: '' },
  emailSubject: { type: String, default: 'Bid Boss Update' },
  emailBody: { type: String, default: '' },
  isEnabled: { type: Boolean, default: true },
  variables: [{ type: String }]
}, { timestamps: true });

export default mongoose.model<INotificationTemplate>('NotificationTemplate', NotificationTemplateSchema);

import mongoose, { Schema, Document } from 'mongoose';

export interface IReleaseRecord extends Document {
  order: mongoose.Types.ObjectId;
  customer: mongoose.Types.ObjectId;
  releasedLots: mongoose.Types.ObjectId[];
  unreleasedLots: Array<{
    lot: mongoose.Types.ObjectId;
    reason: 'Not Found' | 'Customer Refused' | 'Accepted With Resolution' | 'Other';
    notes?: string;
  }>;
  releasedBy: string;
  timestamp: Date;
  pickupCodeUsed?: string;
  authorizedPersonUsed: boolean;
  partialRelease: boolean;
  receiptPrinted: boolean;
  notes?: string;
}

const ReleaseRecordSchema: Schema = new Schema({
  order: { type: Schema.Types.ObjectId, ref: 'Order', required: true },
  customer: { type: Schema.Types.ObjectId, ref: 'Customer', required: true },
  releasedLots: [{ type: Schema.Types.ObjectId, ref: 'Lot' }],
  unreleasedLots: [{
    lot: { type: Schema.Types.ObjectId, ref: 'Lot' },
    reason: { type: String, enum: ['Not Found', 'Customer Refused', 'Accepted With Resolution', 'Other'] },
    notes: { type: String }
  }],
  releasedBy: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  pickupCodeUsed: { type: String },
  authorizedPersonUsed: { type: Boolean, default: false },
  partialRelease: { type: Boolean, default: false },
  receiptPrinted: { type: Boolean, default: false },
  notes: { type: String }
}, { timestamps: true });

export default mongoose.model<IReleaseRecord>('ReleaseRecord', ReleaseRecordSchema);

import mongoose, { Schema, Document } from 'mongoose';

export interface ICase extends Document {
  caseNumber: string;
  auctionRun: mongoose.Types.ObjectId;
  order: mongoose.Types.ObjectId;
  customer: mongoose.Types.ObjectId;
  customerName: string;
  bidderNumber: string;
  type: 'Missing in Prep' | 'Missing at Release' | 'Refused' | 'Issue' | 'Return' | 'Dispute';
  status: 'Open' | 'In Review' | 'Resolved';
  lines: Array<{
    lotNumber: string;
    reason: string;
    status: string;
    notes: string;
  }>;
  evidence: string[];
  refundStatus: 'None' | 'Requested' | 'Authorized' | 'Applied';
  refundAmount: number;
  refundMethod?: string;
  createdBy: string;
  creditGenerated?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const CaseSchema: Schema = new Schema({
  caseNumber: { type: String, required: true, unique: true },
  auctionRun: { type: Schema.Types.ObjectId, ref: 'AuctionRun', required: true },
  order: { type: Schema.Types.ObjectId, ref: 'Order', required: true },
  customer: { type: Schema.Types.ObjectId, ref: 'Customer', required: true },
  customerName: { type: String, required: true },
  bidderNumber: { type: String, required: true },
  type: { 
    type: String, 
    enum: ['Missing in Prep', 'Missing at Release', 'Refused', 'Issue', 'Return', 'Dispute'],
    required: true 
  },
  status: { 
    type: String, 
    enum: ['Open', 'In Review', 'Resolved'], 
    default: 'Open' 
  },
  lines: [{
    lotNumber: String,
    reason: String,
    status: String,
    notes: String
  }],
  evidence: [{ type: String }],
  refundStatus: {
    type: String,
    enum: ['None', 'Requested', 'Authorized', 'Applied'],
    default: 'None'
  },
  refundAmount: { type: Number, default: 0 },
  refundMethod: { type: String, default: '' },
  creditGenerated: { type: Schema.Types.ObjectId, ref: 'Credit' },
  createdBy: { type: String, default: 'System' }
}, { timestamps: true });

export default mongoose.model<ICase>('Case', CaseSchema);

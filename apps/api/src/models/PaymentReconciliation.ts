import mongoose, { Schema, Document } from 'mongoose';

export interface IPaymentReconciliation extends Document {
  auctionRun: mongoose.Types.ObjectId;
  order: mongoose.Types.ObjectId;
  customer: mongoose.Types.ObjectId;
  sourceReport?: string; // e.g. 'Paid Invoices Report', 'Unpaid Invoices Report', 'Manual'
  paidAmount?: number;
  unpaidBalance?: number;
  cashAmount?: number;
  cardPaymentAmount?: number;
  transactionReference?: string;
  paymentStatus: 'Paid' | 'Unpaid' | 'Failed' | 'Pending' | 'Manual Review';
  importTimestamp: Date;
  manualOverrideBy?: string;
  manualOverrideTimestamp?: Date;
  notes?: string;
}

const PaymentReconciliationSchema: Schema = new Schema({
  auctionRun: { type: Schema.Types.ObjectId, ref: 'AuctionRun', required: true },
  order: { type: Schema.Types.ObjectId, ref: 'Order', required: true },
  customer: { type: Schema.Types.ObjectId, ref: 'Customer', required: true },
  sourceReport: { type: String },
  paidAmount: { type: Number, default: 0 },
  unpaidBalance: { type: Number, default: 0 },
  cashAmount: { type: Number, default: 0 },
  cardPaymentAmount: { type: Number, default: 0 },
  transactionReference: { type: String },
  paymentStatus: {
    type: String,
    enum: ['Paid', 'Unpaid', 'Failed', 'Pending', 'Manual Review'],
    required: true
  },
  importTimestamp: { type: Date, default: Date.now },
  manualOverrideBy: { type: String },
  manualOverrideTimestamp: { type: Date },
  notes: { type: String }
}, { timestamps: true });

export default mongoose.model<IPaymentReconciliation>('PaymentReconciliation', PaymentReconciliationSchema);

import mongoose, { Schema, Document } from 'mongoose';

export interface ICreditUsage {
  order: mongoose.Types.ObjectId;
  amountUsed: number;
  usedAt: Date;
}

export interface ICredit extends Document {
  customer: mongoose.Types.ObjectId;
  sourceCase?: mongoose.Types.ObjectId;
  sourceOrder?: mongoose.Types.ObjectId;
  amount: number;
  reason?: string;
  expiryDate?: Date;
  status: 'Active' | 'Partially Used' | 'Used' | 'Expired' | 'Voided';
  usedAmount: number;
  remainingBalance: number;
  history: ICreditUsage[];
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

const CreditSchema: Schema = new Schema({
  customer: { type: Schema.Types.ObjectId, ref: 'Customer', required: true },
  sourceCase: { type: Schema.Types.ObjectId, ref: 'Case' },
  sourceOrder: { type: Schema.Types.ObjectId, ref: 'Order' },
  amount: { type: Number, required: true, min: 0 },
  reason: { type: String },
  expiryDate: { type: Date },
  status: {
    type: String,
    enum: ['Active', 'Partially Used', 'Used', 'Expired', 'Voided'],
    default: 'Active'
  },
  usedAmount: { type: Number, default: 0, min: 0 },
  remainingBalance: { type: Number, required: true, min: 0 },
  history: [{
    order: { type: Schema.Types.ObjectId, ref: 'Order', required: true },
    amountUsed: { type: Number, required: true },
    usedAt: { type: Date, default: Date.now }
  }],
  createdBy: { type: String, default: 'System' }
}, { timestamps: true });

// Ensure remainingBalance is synced prior to save validation
CreditSchema.pre('validate', function(next) {
  const self = this as any;
  if (self.amount !== undefined && self.amount !== null && self.usedAmount !== undefined && self.usedAmount !== null) {
    self.remainingBalance = self.amount - self.usedAmount;
    if (self.remainingBalance === 0) {
      self.status = 'Used';
    } else if (self.usedAmount > 0 && self.remainingBalance > 0) {
      self.status = 'Partially Used';
    }
  }
  next();
});

export default mongoose.model<ICredit>('Credit', CreditSchema);

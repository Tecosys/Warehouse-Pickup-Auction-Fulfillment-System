import mongoose, { Schema, Document } from 'mongoose';

export interface IRate {
  id: string;
  provider: 'Stallion' | 'Freightcom';
  carrier: string;
  serviceName: string;
  baseRate: number;
  customerCharge: number;
  estimatedDays?: number;
}

export interface IParcel extends Document {
  order: mongoose.Types.ObjectId;
  lots: mongoose.Types.ObjectId[];
  status: 'In Queue' | 'Preparing' | 'Awaiting Payment' | 'Dispatched';
  dimensions: {
    length: number;
    width: number;
    height: number;
    weight: number;
  };
  rates: IRate[];
  selectedRateId?: string;
  trackingNumber?: string;
  createdAt: Date;
  updatedAt: Date;
}

const RateSchema = new Schema({
  id: { type: String, required: true },
  provider: { type: String, enum: ['Stallion', 'Freightcom'], required: true },
  carrier: { type: String, required: true },
  serviceName: { type: String, required: true },
  baseRate: { type: Number, required: true },
  customerCharge: { type: Number, required: true },
  estimatedDays: { type: Number }
});

const ParcelSchema: Schema = new Schema({
  order: { type: Schema.Types.ObjectId, ref: 'Order', required: true },
  lots: [{ type: Schema.Types.ObjectId, ref: 'Lot' }],
  status: { 
    type: String, 
    enum: ['In Queue', 'Preparing', 'Awaiting Payment', 'Dispatched'], 
    default: 'In Queue' 
  },
  dimensions: {
    length: { type: Number, default: 0 },
    width: { type: Number, default: 0 },
    height: { type: Number, default: 0 },
    weight: { type: Number, default: 0 }
  },
  rates: [RateSchema],
  selectedRateId: { type: String },
  trackingNumber: { type: String }
}, { timestamps: true });

export default mongoose.model<IParcel>('Parcel', ParcelSchema);

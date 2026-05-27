import mongoose, { Schema, Document } from 'mongoose';

export interface IRate {
  id: string;
  _id?: any;
  provider: 'Stallion' | 'Freightcom';
  carrier: string;
  serviceName: string;
  baseRate: number;
  customerCharge: number;
  estimatedDays?: number;
}

export interface IParcel extends Document {
  shipment?: mongoose.Types.ObjectId;
  order: mongoose.Types.ObjectId;
  lots: mongoose.Types.ObjectId[];
  sequenceNumber: number;
  unitLetter?: string;
  unitType?: 'Parcel' | 'Mailer' | 'Pallet' | 'Freight Piece';
  status: 'In Queue' | 'Preparing' | 'Awaiting Payment' | 'Label Ready' | 'Dispatched';
  dimensions: {
    length: number;
    width: number;
    height: number;
    weight: number;
  };
  packingDetails?: string;
  rates: IRate[];
  selectedRateId?: string;
  trackingNumber?: string;
  internalLabelPrinted?: boolean;
  customsRequired?: boolean;
  customsRecordReference?: string;
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
  shipment: { type: Schema.Types.ObjectId, ref: 'Shipment' },
  order: { type: Schema.Types.ObjectId, ref: 'Order', required: true },
  lots: [{ type: Schema.Types.ObjectId, ref: 'Lot' }],
  sequenceNumber: { type: Number, default: 1 },
  unitLetter: { type: String },
  unitType: { 
    type: String, 
    enum: ['Parcel', 'Mailer', 'Pallet', 'Freight Piece'],
    default: 'Parcel'
  },
  status: { 
    type: String, 
    enum: ['In Queue', 'Preparing', 'Awaiting Payment', 'Label Ready', 'Dispatched'], 
    default: 'In Queue' 
  },
  dimensions: {
    length: { type: Number, default: 0 },
    width: { type: Number, default: 0 },
    height: { type: Number, default: 0 },
    weight: { type: Number, default: 0 }
  },
  packingDetails: { type: String, default: '' },
  rates: [RateSchema],
  selectedRateId: { type: String },
  trackingNumber: { type: String },
  internalLabelPrinted: { type: Boolean, default: false },
  customsRequired: { type: Boolean, default: false },
  customsRecordReference: { type: String }
}, { timestamps: true });

export default mongoose.model<IParcel>('Parcel', ParcelSchema);

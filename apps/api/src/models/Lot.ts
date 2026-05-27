import mongoose, { Schema, Document } from 'mongoose';

export interface ILot extends Document {
  order: mongoose.Types.ObjectId;
  auctionRun: mongoose.Types.ObjectId;
  parcel?: mongoose.Types.ObjectId;
  lotNumber: string;
  section: string;
  manifestItemId: string;
  title?: string;
  description: string;
  hammerPrice?: number;
  buyerPremiumPortion?: number;
  taxPortion?: number;
  sourceLocation: string;
  finalPickupLocation: string;
  status: 'Pending' | 'Ready' | 'Not Found in Prep' | 'Hold/Issue' | 'Return Received';
  type: 'Sort' | 'Non-Sort';
  releaseStatus: 'Unreleased' | 'Released' | 'Refused' | 'Not Found';
  condition?: string;
  lpn?: string;
  retailPrice?: number;
  retailerUrl?: string;
  auctionStartingPrice?: number;
  qty?: number;
  internalSku?: string;
  metadata: Record<string, any>;
}

const LotSchema: Schema = new Schema({
  order: { type: Schema.Types.ObjectId, ref: 'Order', required: true },
  auctionRun: { type: Schema.Types.ObjectId, ref: 'AuctionRun', required: true },
  parcel: { type: Schema.Types.ObjectId, ref: 'Parcel' },
  lotNumber: { type: String, required: true },
  section: { type: String, default: '' },
  manifestItemId: { type: String, default: '' }, // ManyFast Manifest Item ID (QR/internal ID)
  title: { type: String },
  description: { type: String },
  hammerPrice: { type: Number, default: 0 },
  buyerPremiumPortion: { type: Number, default: 0 },
  taxPortion: { type: Number, default: 0 },
  sourceLocation: { type: String },
  finalPickupLocation: { type: String, default: '' },
  status: { 
    type: String, 
    enum: ['Pending', 'Ready', 'Not Found in Prep', 'Hold/Issue', 'Return Received'], 
    default: 'Pending' 
  },
  type: { type: String, enum: ['Sort', 'Non-Sort'], required: true },
  releaseStatus: {
    type: String,
    enum: ['Unreleased', 'Released', 'Refused', 'Not Found'],
    default: 'Unreleased'
  },
  condition: { type: String, default: '' },
  lpn: { type: String },
  retailPrice: { type: Number },
  retailerUrl: { type: String },
  auctionStartingPrice: { type: Number },
  qty: { type: Number, default: 1 },
  internalSku: { type: String },
  metadata: { type: Schema.Types.Mixed, default: {} }
}, { timestamps: true });

export default mongoose.model<ILot>('Lot', LotSchema);

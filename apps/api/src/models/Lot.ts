import mongoose, { Schema, Document } from 'mongoose';

export interface ILot extends Document {
  order: mongoose.Types.ObjectId;
  auctionRun: mongoose.Types.ObjectId;
  lotNumber: string;
  description: string;
  sourceLocation: string;
  finalPickupLocation: string;
  status: 'Pending' | 'Ready' | 'Not Found' | 'Hold/Issue';
  type: 'Sort' | 'Non-Sort';
}

const LotSchema: Schema = new Schema({
  order: { type: Schema.Types.ObjectId, ref: 'Order', required: true },
  auctionRun: { type: Schema.Types.ObjectId, ref: 'AuctionRun', required: true },
  lotNumber: { type: String, required: true },
  description: { type: String },
  sourceLocation: { type: String },
  finalPickupLocation: { type: String, default: '' },
  status: { 
    type: String, 
    enum: ['Pending', 'Ready', 'Not Found', 'Hold/Issue'], 
    default: 'Pending' 
  },
  type: { type: String, enum: ['Sort', 'Non-Sort'], required: true }
});

export default mongoose.model<ILot>('Lot', LotSchema);

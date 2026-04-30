import mongoose, { Schema, Document } from 'mongoose';

export interface IAuctionRun extends Document {
  auctionNumber: string;
  title: string;
  importedDate: Date;
  status: 'Active' | 'Archived';
  stats: {
    totalOrders: number;
    readyCount: number;
    customersBooked: number;
    shippingInQueue: number;
    openCases: number;
  };
}

const AuctionRunSchema: Schema = new Schema({
  auctionNumber: { type: String, required: true },
  title: { type: String, required: true },
  importedDate: { type: Date, default: Date.now },
  status: { type: String, enum: ['Active', 'Archived'], default: 'Active' },
  stats: {
    totalOrders: { type: Number, default: 0 },
    readyCount: { type: Number, default: 0 },
    customersBooked: { type: Number, default: 0 },
    shippingInQueue: { type: Number, default: 0 },
    openCases: { type: Number, default: 0 }
  }
});

export default mongoose.model<IAuctionRun>('AuctionRun', AuctionRunSchema);

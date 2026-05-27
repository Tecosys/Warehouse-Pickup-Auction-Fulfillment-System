import mongoose, { Schema, Document } from 'mongoose';

export interface IAuctionRun extends Document {
  auctionNumber: string;
  title: string;
  startDate?: Date;
  closeDate?: Date;
  importedDate: Date;
  status: 'Active' | 'Archived';
  readyForBooks: boolean;
  uploadedFiles: string[];
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
  startDate: { type: Date },
  closeDate: { type: Date },
  importedDate: { type: Date, default: Date.now },
  status: { type: String, enum: ['Active', 'Archived'], default: 'Active' },
  readyForBooks: { type: Boolean, default: false },
  uploadedFiles: [{ type: String }],
  stats: {
    totalOrders: { type: Number, default: 0 },
    readyCount: { type: Number, default: 0 },
    customersBooked: { type: Number, default: 0 },
    shippingInQueue: { type: Number, default: 0 },
    openCases: { type: Number, default: 0 }
  }
});

export default mongoose.model<IAuctionRun>('AuctionRun', AuctionRunSchema);

import mongoose, { Schema, Document } from 'mongoose';

export interface ISlot extends Document {
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  maxCapacity: number;
  currentBookings: number;
  auctionRun: mongoose.Types.ObjectId;
}

const SlotSchema: Schema = new Schema({
  date: { type: String, required: true },
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
  maxCapacity: { type: Number, default: 5 },
  currentBookings: { type: Number, default: 0 },
  auctionRun: { type: Schema.Types.ObjectId, ref: 'AuctionRun', required: true }
}, { timestamps: true });

// Ensure uniqueness per auction run + time
SlotSchema.index({ auctionRun: 1, date: 1, startTime: 1 }, { unique: true });

export default mongoose.model<ISlot>('Slot', SlotSchema);

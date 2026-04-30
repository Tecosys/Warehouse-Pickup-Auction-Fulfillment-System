import mongoose, { Schema, Document } from 'mongoose';

export interface IOrder extends Document {
  auctionRun: mongoose.Types.ObjectId;
  bidderNumber: string;
  customer: mongoose.Types.ObjectId;
  bookingCode: string;
  fulfillmentStatus: 'Not Started' | 'In Progress' | 'Ready';
  customerStatus: 'Awaiting Choice' | 'Booked' | 'Checked In' | 'Picked Up' | 'Shipping Selected' | 'Cancelled';
  appointmentTime?: Date;
  isCheckedIn: boolean;
  workerName?: string;
  startTimestamp?: Date;
  completeTimestamp?: Date;
}

const OrderSchema: Schema = new Schema({
  auctionRun: { type: Schema.Types.ObjectId, ref: 'AuctionRun', required: true },
  bidderNumber: { type: String, required: true },
  customer: { type: Schema.Types.ObjectId, ref: 'Customer', required: true },
  bookingCode: { type: String },
  fulfillmentStatus: { 
    type: String, 
    enum: ['Not Started', 'In Progress', 'Ready'], 
    default: 'Not Started' 
  },
  customerStatus: { 
    type: String, 
    enum: ['Awaiting Choice', 'Booked', 'Checked In', 'Picked Up', 'Shipping Selected', 'Cancelled'], 
    default: 'Awaiting Choice' 
  },
  appointmentTime: { type: Date },
  isCheckedIn: { type: Boolean, default: false },
  workerName: { type: String },
  startTimestamp: { type: Date },
  completeTimestamp: { type: Date }
});

export default mongoose.model<IOrder>('Order', OrderSchema);

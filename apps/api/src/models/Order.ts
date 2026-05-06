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
  retrievalMethod: 'Undecided' | 'Pickup' | 'Shipping' | 'Local Delivery';
  shippingStatus: 'In Queue' | 'Prepared' | 'Dispatched';
  trackingNumber?: string;
  shippedAt?: Date;
  isReturnProcessed: boolean;
  cancellationReason?: string;
  isShippingConfirmed: boolean;
  hibidData: {
    name?: string;
    email?: string;
    phone?: string;
    phone2?: string;
    address?: string;
    state?: string;
    zip?: string;
    highBid?: string;
    maxBid?: string;
    bids?: string;
    metadata: Record<string, any>;
  };
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
  completeTimestamp: { type: Date },
  retrievalMethod: {
    type: String,
    enum: ['Undecided', 'Pickup', 'Shipping', 'Local Delivery'],
    default: 'Undecided'
  },
  shippingStatus: {
    type: String,
    enum: ['In Queue', 'Prepared', 'Dispatched'],
    default: 'In Queue'
  },
  trackingNumber: { type: String },
  shippedAt: { type: Date },
  isReturnProcessed: { type: Boolean, default: false },
  cancellationReason: { type: String },
  isShippingConfirmed: { type: Boolean, default: false },
  hibidData: {
    name: { type: String },
    email: { type: String },
    phone: { type: String },
    phone2: { type: String },
    address: { type: String },
    state: { type: String },
    zip: { type: String },
    highBid: { type: String },
    maxBid: { type: String },
    bids: { type: String },
    metadata: { type: Schema.Types.Mixed, default: {} }
  }
}, { timestamps: true });

export default mongoose.model<IOrder>('Order', OrderSchema);

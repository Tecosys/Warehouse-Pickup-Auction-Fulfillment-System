import mongoose, { Schema, Document } from 'mongoose';

export interface IOrder extends Document {
  auctionRun: mongoose.Types.ObjectId;
  bidderNumber: string;
  customer: mongoose.Types.ObjectId;
  bookingCode: string;
  selectedSlot?: mongoose.Types.ObjectId;
  fulfillmentStatus: 'Not Started' | 'In Progress' | 'Ready';
  customerStatus: 'Awaiting Choice' | 'Booked' | 'Checked In' | 'Picked Up' | 'Shipping Selected' | 'Cancelled';
  lifecycleStatus: 'Imported' | 'Awaiting Customer Action' | 'In Preparation' | 'Ready' | 'Checked In' | 'Released' | 'Partially Released' | 'Shipping' | 'Dispatched' | 'Closed' | 'Cancelled' | 'Hold';
  pickupStatus: 'Not Booked' | 'Booked' | 'Reminder Sent' | 'Checked In' | 'Released' | 'Partially Released' | 'No-Show' | 'Abandoned';
  prepStatus: 'Not Started' | 'In Progress' | 'Ready' | 'Ready with Flag' | 'Exception';
  paymentStatus: 'Unknown' | 'Pending' | 'Paid' | 'Unpaid' | 'Failed' | 'Manual Review' | 'Refunded' | 'Partially Refunded' | 'Credit Issued';
  shippingStatusCustomer: 'Preparing Order' | 'Awaiting Payment' | 'Preparing Shipment' | 'Dispatched' | 'Issue Under Review' | 'Resolved';
  appointmentTime?: Date;
  isCheckedIn: boolean;
  workerName?: string;
  startTimestamp?: Date;
  completeTimestamp?: Date;
  authorizedPerson?: {
    name: string;
    phone: string;
    email: string;
  };
  retrievalMethod: 'Undecided' | 'Pickup' | 'Shipping' | 'Local Delivery' | 'Awaiting Choice';
  shippingStatus: 'Shipping Selected' | 'In Shipping Queue' | 'Packing In Progress' | 'Ready for Rating' | 'Awaiting AF360 Charge' | 'Awaiting Payment' | 'Payment Failed' | 'Payment Confirmed' | 'Label Ready' | 'Dispatched' | 'Exception / Hold';
  trackingNumber?: string;
  shippedAt?: Date;
  isReturnProcessed: boolean;
  cancellationReason?: string;
  isShippingConfirmed: boolean;
  addedToAF360: boolean;
  invoiceReference?: string;
  totalLots: number;
  totalHammer: number;
  buyerPremium: number;
  handlingFee: number;
  taxAmount: number;
  paidAmount: number;
  unpaidBalance: number;
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
  selectedSlot: { type: Schema.Types.ObjectId, ref: 'Slot' },
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
  lifecycleStatus: { 
    type: String, 
    enum: ['Imported', 'Awaiting Customer Action', 'In Preparation', 'Ready', 'Checked In', 'Released', 'Partially Released', 'Shipping', 'Dispatched', 'Closed', 'Cancelled', 'Hold'], 
    default: 'Imported' 
  },
  pickupStatus: { 
    type: String, 
    enum: ['Not Booked', 'Booked', 'Reminder Sent', 'Checked In', 'Released', 'Partially Released', 'No-Show', 'Abandoned'], 
    default: 'Not Booked' 
  },
  prepStatus: { 
    type: String, 
    enum: ['Not Started', 'In Progress', 'Ready', 'Ready with Flag', 'Exception'], 
    default: 'Not Started' 
  },
  paymentStatus: { 
    type: String, 
    enum: ['Unknown', 'Pending', 'Paid', 'Unpaid', 'Failed', 'Manual Review', 'Refunded', 'Partially Refunded', 'Credit Issued'], 
    default: 'Unknown' 
  },
  shippingStatusCustomer: {
    type: String,
    enum: ['Preparing Order', 'Awaiting Payment', 'Preparing Shipment', 'Dispatched', 'Issue Under Review', 'Resolved'],
    default: 'Preparing Order'
  },
  appointmentTime: { type: Date },
  isCheckedIn: { type: Boolean, default: false },
  workerName: { type: String },
  startTimestamp: { type: Date },
  completeTimestamp: { type: Date },
  authorizedPerson: {
    name: { type: String, default: '' },
    phone: { type: String, default: '' },
    email: { type: String, default: '' }
  },
  retrievalMethod: {
    type: String,
    enum: ['Undecided', 'Pickup', 'Shipping', 'Local Delivery', 'Awaiting Choice'],
    default: 'Awaiting Choice'
  },
  shippingStatus: {
    type: String,
    enum: ['Shipping Selected', 'In Shipping Queue', 'Packing In Progress', 'Ready for Rating', 'Awaiting AF360 Charge', 'Awaiting Payment', 'Payment Failed', 'Payment Confirmed', 'Label Ready', 'Dispatched', 'Exception / Hold'],
    default: 'Shipping Selected'
  },
  trackingNumber: { type: String },
  shippedAt: { type: Date },
  isReturnProcessed: { type: Boolean, default: false },
  cancellationReason: { type: String },
  isShippingConfirmed: { type: Boolean, default: false },
  addedToAF360: { type: Boolean, default: false },
  invoiceReference: { type: String },
  totalLots: { type: Number, default: 0 },
  totalHammer: { type: Number, default: 0 },
  buyerPremium: { type: Number, default: 0 },
  handlingFee: { type: Number, default: 0 },
  taxAmount: { type: Number, default: 0 },
  paidAmount: { type: Number, default: 0 },
  unpaidBalance: { type: Number, default: 0 },
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

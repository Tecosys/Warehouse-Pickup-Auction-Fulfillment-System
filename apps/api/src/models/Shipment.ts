import mongoose, { Schema, Document } from 'mongoose';

export interface IShipment extends Document {
  order: mongoose.Types.ObjectId;
  customer: mongoose.Types.ObjectId;
  auctionRun: mongoose.Types.ObjectId;
  shipToAddress: {
    address1: string;
    address2?: string;
    city: string;
    state: string;
    zip: string;
    country: string;
  };
  shippingStatusInternal: 'Shipping Selected' | 'In Shipping Queue' | 'Packing In Progress' | 'Ready for Rating' | 'Awaiting AF360 Charge' | 'Awaiting Payment' | 'Payment Failed' | 'Payment Confirmed' | 'Label Ready' | 'Dispatched' | 'Hold';
  shippingStatusCustomer: 'Preparing Order' | 'Awaiting Payment' | 'Preparing Shipment' | 'Dispatched' | 'Issue Under Review' | 'Resolved';
  carrierProvider?: 'Stallion' | 'Freightcom' | 'Manual';
  selectedService?: string;
  customerShippingCharge?: number;
  paymentStatus: 'Pending' | 'Paid' | 'Unpaid' | 'Failed' | 'Refunded';
  trackingSummary?: string;
  dispatchStatus: 'Not Dispatched' | 'Dispatched' | 'In Transit' | 'Delivered' | 'Returned';
  createdAt: Date;
  updatedAt: Date;
}

const ShipmentSchema: Schema = new Schema({
  order: { type: Schema.Types.ObjectId, ref: 'Order', required: true },
  customer: { type: Schema.Types.ObjectId, ref: 'Customer', required: true },
  auctionRun: { type: Schema.Types.ObjectId, ref: 'AuctionRun', required: true },
  shipToAddress: {
    address1: { type: String, required: true },
    address2: { type: String },
    city: { type: String, required: true },
    state: { type: String, required: true },
    zip: { type: String, required: true },
    country: { type: String, required: true }
  },
  shippingStatusInternal: {
    type: String,
    enum: ['Shipping Selected', 'In Shipping Queue', 'Packing In Progress', 'Ready for Rating', 'Awaiting AF360 Charge', 'Awaiting Payment', 'Payment Failed', 'Payment Confirmed', 'Label Ready', 'Dispatched', 'Hold'],
    default: 'Shipping Selected'
  },
  shippingStatusCustomer: {
    type: String,
    enum: ['Preparing Order', 'Awaiting Payment', 'Preparing Shipment', 'Dispatched', 'Issue Under Review', 'Resolved'],
    default: 'Preparing Order'
  },
  carrierProvider: { type: String, enum: ['Stallion', 'Freightcom', 'Manual'] },
  selectedService: { type: String },
  customerShippingCharge: { type: Number, default: 0 },
  paymentStatus: { type: String, enum: ['Pending', 'Paid', 'Unpaid', 'Failed', 'Refunded'], default: 'Pending' },
  trackingSummary: { type: String },
  dispatchStatus: { type: String, enum: ['Not Dispatched', 'Dispatched', 'In Transit', 'Delivered', 'Returned'], default: 'Not Dispatched' }
}, { timestamps: true });

export default mongoose.model<IShipment>('Shipment', ShipmentSchema);

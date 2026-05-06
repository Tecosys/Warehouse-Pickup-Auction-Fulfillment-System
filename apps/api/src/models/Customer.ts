import mongoose, { Schema, Document } from 'mongoose';

export interface IAddress {
  address1: string;
  address2?: string;
  city: string;
  state: string;
  zip: string;
  country: string;
}

export interface ICustomer extends Document {
  bidderNumber: string;
  firstName: string;
  lastName: string;
  name: string; // Combined name for display
  companyName?: string;
  customerCode?: string;
  phone: string;
  phone2?: string;
  email: string;
  billTo: IAddress;
  shipTo: IAddress;
  isShippingRequested: boolean;
  metadata: Record<string, any>;
}

const AddressSchema = new Schema({
  address1: { type: String, default: '' },
  address2: { type: String, default: '' },
  city: { type: String, default: '' },
  state: { type: String, default: '' },
  zip: { type: String, default: '' },
  country: { type: String, default: '' }
}, { _id: false });

const CustomerSchema: Schema = new Schema({
  bidderNumber: { type: String, required: true, unique: true },
  firstName: { type: String, default: '' },
  lastName: { type: String, default: '' },
  name: { type: String, required: true },
  companyName: { type: String, default: '' },
  customerCode: { type: String, default: '' },
  phone: { type: String },
  phone2: { type: String },
  email: { type: String },
  billTo: { type: AddressSchema, default: () => ({}) },
  shipTo: { type: AddressSchema, default: () => ({}) },
  isShippingRequested: { type: Boolean, default: false },
  metadata: { type: Schema.Types.Mixed, default: {} }
}, { timestamps: true });

export default mongoose.model<ICustomer>('Customer', CustomerSchema);

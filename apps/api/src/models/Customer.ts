import mongoose, { Schema, Document } from 'mongoose';

export interface ICustomer extends Document {
  bidderNumber: string;
  name: string;
  phone: string;
  email: string;
}

const CustomerSchema: Schema = new Schema({
  bidderNumber: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  phone: { type: String },
  email: { type: String }
});

export default mongoose.model<ICustomer>('Customer', CustomerSchema);

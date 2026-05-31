import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.join(__dirname, '../../.env') });
import mongoose from 'mongoose';
import { NotificationService } from './src/services/NotificationService';
import Customer from './src/models/Customer';
import AuctionRun from './src/models/AuctionRun';
import Order from './src/models/Order';

async function test() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.DB_URI as string);
    console.log('Connected.');
    console.log('Models loaded:', Customer.modelName, AuctionRun.modelName);
    
    // The user says "customer 1379 has my details". This might be the bidderNumber.
    const order = await Order.findOne({ bidderNumber: '1379' }).populate('customer');
    if (order) {
      console.log(`Found order ${order._id} for customer ${order.customer.name} (${order.customer.email})`);
      // Send template 1 (Auction Win Welcome Notification)
      await NotificationService.send(order._id.toString(), 1);
      console.log('Notification sent successfully!');
    } else {
      console.log('Order with bidder number 1379 not found. Trying to find by email...');
      const Customer = require('./src/models/Customer').default;
      const customer = await Customer.findOne({ email: 'waltonbdagr1@gmail.com' });
      if (customer) {
        console.log(`Found customer ${customer.name}, looking for orders...`);
        const custOrder = await Order.findOne({ customer: customer._id }).populate('customer');
        if (custOrder) {
          await NotificationService.send(custOrder._id.toString(), 1);
          console.log('Notification sent successfully!');
        } else {
          console.log('Customer has no orders.');
        }
      } else {
        console.log('Customer not found by email either.');
      }
    }
  } catch (error) {
    console.error('Test error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected.');
  }
}

test();

import mongoose from 'mongoose';
import path from 'path';
import dotenv from 'dotenv';

// Load env from root
dotenv.config({ path: path.join(__dirname, '../../../.env') });

const MONGODB_URI = process.env.DB_URI;

if (!MONGODB_URI) {
  console.error('Error: DB_URI is not defined in .env');
  process.exit(1);
}

const testEmail = process.argv[2];

if (!testEmail) {
  console.error('Usage: npx tsx scratch/set_test_email.ts <your_email@example.com>');
  process.exit(1);
}

async function setTestEmail() {
  try {
    await mongoose.connect(MONGODB_URI as string);
    console.log('Connected to MongoDB.');

    const db = mongoose.connection.db;
    
    // Find the first customer in the active auction
    const activeAuction = await db?.collection('auctionruns').findOne({}, { sort: { importedDate: -1 } });
    if (!activeAuction) {
      console.error('No active auction run found.');
      await mongoose.disconnect();
      process.exit(1);
    }
    
    console.log(`Active Auction: ${activeAuction.title} (#${activeAuction.auctionNumber})`);

    const order = await db?.collection('orders').findOne({ auctionRun: activeAuction._id });
    if (!order) {
      console.error('No orders found for the active auction.');
      await mongoose.disconnect();
      process.exit(1);
    }

    const customer = await db?.collection('customers').findOne({ _id: order.customer });
    if (!customer) {
      console.error('Customer not found for the first order.');
      await mongoose.disconnect();
      process.exit(1);
    }

    console.log(`Found Customer: ${customer.name} (Bidder #${customer.bidderNumber})`);
    console.log(`Current email: ${customer.email || 'None'}`);

    // Update the email address
    await db?.collection('customers').updateOne(
      { _id: customer._id },
      { $set: { email: testEmail } }
    );

    console.log(`Successfully updated email to: ${testEmail}`);
    console.log(`\nTo test, go to http://localhost:5173/`);
    console.log(`1. Log in as admin / admin123`);
    console.log(`2. Go to Batch Notifications`);
    console.log(`3. Under "Phase 1: Initial Outreach & Booking", find "Initial Action Link" (ID 01)`);
    console.log(`4. Click "Send Now"`);
    console.log(`5. This will trigger a batch. It will send an email to ${testEmail} (since they are in this auction)!`);

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

setTestEmail();

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

async function checkData() {
  try {
    await mongoose.connect(MONGODB_URI as string);
    console.log('Connected to MongoDB.');

    const db = mongoose.connection.db;
    
    const auctionRuns = await db?.collection('auctionruns').countDocuments();
    const customers = await db?.collection('customers').countDocuments();
    const orders = await db?.collection('orders').countDocuments();
    const lots = await db?.collection('lots').countDocuments();

    console.log('--- Database Stats ---');
    console.log(`Auction Runs: ${auctionRuns}`);
    console.log(`Customers:    ${customers}`);
    console.log(`Orders:       ${orders}`);
    console.log(`Lots:         ${lots}`);
    
    if (auctionRuns && auctionRuns > 0) {
      const latestRun = await db?.collection('auctionruns').find().sort({ createdAt: -1 }).limit(1).toArray();
      console.log('\nLatest Auction Run:', JSON.stringify(latestRun, null, 2));
    }

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('Error checking data:', err);
    process.exit(1);
  }
}

checkData();

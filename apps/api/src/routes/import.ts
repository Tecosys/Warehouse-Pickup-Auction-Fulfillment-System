import express from 'express';
import multer from 'multer';
import csv from 'csv-parser';
import fs from 'fs';
import path from 'path';
import AuctionRun from '../models/AuctionRun';
import Customer from '../models/Customer';
import Order from '../models/Order';
import Lot from '../models/Lot';

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

// Helper to parse CSV
const parseCSV = (filePath: string): Promise<any[]> => {
  return new Promise((resolve, reject) => {
    const results: any[] = [];
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', () => {
        resolve(results);
        fs.unlinkSync(filePath); // Clean up
      })
      .on('error', (err) => reject(err));
  });
};

router.post('/', upload.fields([
  { name: 'catalog', maxCount: 1 },
  { name: 'winning', maxCount: 1 },
  { name: 'bidders', maxCount: 1 }
]), async (req: any, res: any) => {
  try {
    const { auctionNumber, auctionTitle } = req.body;
    const files = req.files;

    if (!files.catalog || !files.winning || !files.bidders) {
      return res.status(400).json({ error: 'All 3 files are required' });
    }

    const catalogData = await parseCSV(files.catalog[0].path);
    const winningData = await parseCSV(files.winning[0].path);
    const biddersData = await parseCSV(files.bidders[0].path);

    // 1. Create Auction Run
    const auctionRun = new AuctionRun({
      auctionNumber,
      title: auctionTitle,
    });
    await auctionRun.save();

    // 2. Process Bidders (Customers)
    // We'll use a map for quick lookup
    const bidderMap = new Map();
    for (const b of biddersData) {
      const bidderNum = b['Bidder Number'] || b['bidder_number'];
      const name = b['Name'] || b['name'];
      const email = b['Email'] || b['email'];
      const phone = b['Phone'] || b['phone'];

      if (bidderNum) {
        let customer = await Customer.findOne({ bidderNumber: bidderNum });
        if (!customer) {
          customer = new Customer({ bidderNumber: bidderNum, name, email, phone });
          await customer.save();
        }
        bidderMap.set(bidderNum, customer);
      }
    }

    // 3. Process Winning Results & Catalog (Orders & Lots)
    const ordersMap = new Map(); // bidderNum -> Order Object
    let lotsCreated = 0;

    // Create a map for catalog locations
    const catalogMap = new Map();
    for (const c of catalogData) {
      const lotNum = c['Lot Number'] || c['lot_number'];
      const location = c['Storage Location'] || c['storage_location'] || c['Location'];
      if (lotNum) catalogMap.set(lotNum, location);
    }

    for (const w of winningData) {
      const lotNum = w['Lot Number'] || w['lot_number'];
      const bidderNum = w['Bidder Number'] || w['bidder_number'];
      const desc = w['Description'] || w['description'] || 'No description';

      if (!lotNum || !bidderNum) continue;

      // Get or Create Order
      let order = ordersMap.get(bidderNum);
      if (!order) {
        const customer = bidderMap.get(bidderNum);
        if (!customer) continue;

        order = new Order({
          auctionRun: auctionRun._id,
          bidderNumber: bidderNum,
          customer: customer._id,
          bookingCode: `BB-${auctionNumber}-${bidderNum}`
        });
        await order.save();
        ordersMap.set(bidderNum, order);
      }

      // Create Lot
      const sourceLocation = catalogMap.get(lotNum) || 'TBD';
      const type = sourceLocation.startsWith('B') ? 'Sort' : 'Non-Sort';

      const lot = new Lot({
        order: order._id,
        auctionRun: auctionRun._id,
        lotNumber: lotNum,
        description: desc,
        sourceLocation,
        type
      });
      await lot.save();
      lotsCreated++;
    }

    // 4. Update Auction Run Stats
    auctionRun.stats = {
      totalOrders: ordersMap.size,
      readyCount: 0,
      customersBooked: 0,
      shippingInQueue: 0,
      openCases: 0
    };
    await auctionRun.save();

    res.json({
      success: true,
      stats: {
        ordersCreated: ordersMap.size,
        lotsCreated: lotsCreated,
        customersMatched: bidderMap.size,
        issuesFlagged: 0
      },
      run: {
        id: auctionRun._id,
        number: auctionRun.auctionNumber,
        title: auctionRun.title
      }
    });

  } catch (error: any) {
    console.error('Import error:', error);
    res.status(500).json({ error: 'Import failed', details: error.message });
  }
});

export default router;

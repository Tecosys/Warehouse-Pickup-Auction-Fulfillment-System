import express from 'express';
import multer from 'multer';
import csv from 'csv-parser';
import fs from 'fs';
import path from 'path';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const XLSX = require('xlsx') as typeof import('xlsx');
import { ActivityService } from '../services/ActivityService';
import { NotificationService } from '../services/NotificationService';
import AuctionRun from '../models/AuctionRun';
import Customer from '../models/Customer';
import Order from '../models/Order';
import Lot from '../models/Lot';

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

// ─── File Parsers ─────────────────────────────────────────────────────────────

const parseCSVFile = (filePath: string): Promise<any[]> => {
  return new Promise((resolve, reject) => {
    const results: any[] = [];
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', () => resolve(results))
      .on('error', (err) => reject(err));
  });
};

const parseExcelFile = (filePath: string): any[] => {
  const workbook = XLSX.readFile(filePath);
  const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
  return XLSX.utils.sheet_to_json(firstSheet, { defval: '' });
};

const parseFile = async (filePath: string, originalName: string): Promise<any[]> => {
  const ext = path.extname(originalName ?? '').toLowerCase();
  try {
    if (ext === '.xlsx' || ext === '.xls') {
      return parseExcelFile(filePath);
    } else {
      return await parseCSVFile(filePath);
    }
  } finally {
    try { fs.unlinkSync(filePath); } catch {}
  }
};

const getField = (row: any, ...keys: string[]): string => {
  for (const key of keys) {
    if (row[key] !== undefined && row[key] !== null && String(row[key]).trim() !== '') {
      return String(row[key]).trim();
    }
  }
  return '';
};

// ─── Import Route ─────────────────────────────────────────────────────────────

router.post('/', upload.fields([
  { name: 'hibid', maxCount: 1 },
  { name: 'auctionflex', maxCount: 1 },
  { name: 'manyfast', maxCount: 1 },
]), async (req: any, res: any) => {
  try {
    const { auctionNumber, auctionTitle } = req.body;
    const files = req.files as Record<string, multer.File[]>;

    if (!files?.hibid || !files?.auctionflex || !files?.manyfast) {
      return res.status(400).json({ error: 'All 3 files are required: hibid, auctionflex, manyfast' });
    }

    const [hibidData, auctionflexData, manyfastData] = await Promise.all([
      parseFile(files.hibid[0].path, files.hibid[0].originalname),
      parseFile(files.auctionflex[0].path, files.auctionflex[0].originalname),
      parseFile(files.manyfast[0].path, files.manyfast[0].originalname),
    ]);

    const auctionRun = new AuctionRun({ auctionNumber, title: auctionTitle });
    await auctionRun.save();

    // ── 1. Process AuctionFlex Bidders (Source of Truth for Identity) ─────────
    const bidderMap = new Map<string, any>(); 

    for (const b of auctionflexData) {
      const bidderNum = getField(b, 'BidderNumber', 'Bidder Number');
      if (!bidderNum) continue;

      const firstName = getField(b, 'FirstName', 'First Name');
      const lastName = getField(b, 'LastName', 'Last Name');
      const email = getField(b, 'Email');
      const phone = getField(b, 'Phone1', 'Phone 1');
      const phone2 = getField(b, 'Phone2', 'Phone 2');
      const isShippingRequested = getField(b, 'IsShippingRequested', 'Shipping Requested').toLowerCase() === 'yes';
      
      const billTo = {
        address1: getField(b, 'BillToAddress1'),
        address2: getField(b, 'BillToAddress2'),
        city: getField(b, 'BillToCity'),
        state: getField(b, 'BillToState'),
        zip: getField(b, 'BillToZip'),
        country: getField(b, 'BillToCountry')
      };

      const shipTo = {
        address1: getField(b, 'ShipToAddress1'),
        address2: getField(b, 'ShipToAddress2'),
        city: getField(b, 'ShipToCity'),
        state: getField(b, 'ShipToState'),
        zip: getField(b, 'ShipToZip'),
        country: getField(b, 'ShipToCountry')
      };

      // Store ALL other fields in metadata
      const metadata: any = { ...b };
      
      let customer = await Customer.findOne({ bidderNumber: bidderNum });
      if (customer) {
        customer.firstName = firstName;
        customer.lastName = lastName;
        customer.name = `${firstName} ${lastName}`.trim() || 'Unknown';
        customer.email = email;
        customer.phone = phone;
        customer.phone2 = phone2;
        customer.billTo = billTo;
        customer.shipTo = shipTo;
        customer.isShippingRequested = isShippingRequested;
        customer.metadata = metadata;
        await customer.save();
      } else {
        customer = new Customer({
          bidderNumber: bidderNum,
          firstName,
          lastName,
          name: `${firstName} ${lastName}`.trim() || 'Unknown',
          email,
          phone,
          phone2,
          billTo,
          shipTo,
          isShippingRequested,
          metadata
        });
        await customer.save();
      }
      bidderMap.set(bidderNum, customer);
    }

    // ── 2. Build ManyFast Index (Lot Details) ────────────────────────────────
    const manyfastMap = new Map<string, any>();

    for (const m of manyfastData) {
      const lotId = getField(m, 'Lot+Section', 'Lot'); // Primary key is Lot+Section
      if (!lotId) continue;

      manyfastMap.set(lotId, {
        location: getField(m, 'Location'),
        manifestItemId: getField(m, 'Manifest Item ID'),
        lpn: getField(m, 'LPN'),
        title: getField(m, 'Title'),
        description: getField(m, 'Description'),
        qty: parseInt(getField(m, 'Qty')) || 1,
        retailPrice: parseFloat(getField(m, 'Retail Price').replace('$', '')) || 0,
        retailerUrl: getField(m, 'Retailer Product URL'),
        auctionStartingPrice: parseFloat(getField(m, 'Auction Starting Price').replace('$', '')) || 0,
        internalSku: getField(m, 'Internal SKU'),
        raw: m
      });
    }

    // ── 3. Process HiBid (Winning Results) ───────────────────────────────────
    const ordersMap = new Map<string, any>();
    let lotsCreated = 0;

    for (const h of hibidData) {
      const lotNum = getField(h, 'Lot');
      const winningBidder = getField(h, 'Winning Bidder');
      if (!lotNum || !winningBidder) continue;

      let order = ordersMap.get(winningBidder);
      if (!order) {
        const customer = bidderMap.get(winningBidder);
        if (!customer) continue;

        // Initialize retrieval method based on AuctionFlex flag
        const initialRetrieval = customer.isShippingRequested ? 'Shipping' : 'Undecided';
        const initialStatus = customer.isShippingRequested ? 'Shipping Selected' : 'Awaiting Choice';

        order = new Order({
          auctionRun: auctionRun._id,
          bidderNumber: winningBidder,
          customer: customer._id,
          bookingCode: `BB-${auctionNumber}-${winningBidder}`,
          retrievalMethod: initialRetrieval,
          customerStatus: initialStatus,
          hibidData: {
            name: getField(h, 'Name'),
            email: getField(h, 'Email'),
            phone: getField(h, 'Phone'),
            phone2: getField(h, 'Phone 2'),
            address: getField(h, 'Address'),
            state: getField(h, 'State'),
            zip: getField(h, 'Zip Code'),
            highBid: getField(h, 'High Bid'),
            maxBid: getField(h, 'Max Bid'),
            bids: getField(h, 'Bids'),
            metadata: { ...h }
          }
        });
        await order.save();
        ordersMap.set(winningBidder, order);
      }

      // Matching Lot Details from ManyFast
      const manifest = manyfastMap.get(lotNum);
      const sourceLocation = manifest?.location || 'TBD';
      const type = sourceLocation.startsWith('B') ? 'Sort' : 'Non-Sort';

      const lot = new Lot({
        order: order._id,
        auctionRun: auctionRun._id,
        lotNumber: lotNum,
        manifestItemId: manifest?.manifestItemId || '',
        lpn: manifest?.lpn || '',
        description: manifest?.title || getField(h, 'Title') || 'No description',
        sourceLocation,
        type,
        retailPrice: manifest?.retailPrice || 0,
        retailerUrl: manifest?.retailerUrl || '',
        qty: manifest?.qty || 1,
        internalSku: manifest?.internalSku || '',
        metadata: manifest?.raw || {}
      });
      await lot.save();
      lotsCreated++;
    }

    // ── 4. Update Stats ──────────────────────────────────────────────────────
    auctionRun.stats = {
      totalOrders: ordersMap.size,
      readyCount: 0,
      customersBooked: 0,
      shippingInQueue: 0,
      openCases: 0,
    };
    await auctionRun.save();

    // Log Activity
    await ActivityService.log({
      type: 'Import',
      title: 'Auction Run Imported',
      description: `Successfully imported ${ordersMap.size} orders for Auction #${auctionNumber}.`,
      auctionRun: auctionRun._id,
      metadata: { orderCount: ordersMap.size, lotCount: lotsCreated }
    });

    res.json({
      success: true,
      stats: {
        ordersCreated: ordersMap.size,
        lotsCreated,
        customersMatched: bidderMap.size
      },
      run: auctionRun,
      orders: Array.from(ordersMap.values())
    });

  } catch (error: any) {
    console.error('Import error:', error);
    res.status(500).json({ error: 'Import failed', details: error.message });
  }
});

export default router;

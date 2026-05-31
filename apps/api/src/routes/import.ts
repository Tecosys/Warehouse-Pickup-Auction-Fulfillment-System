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
import Settings from '../models/Settings';

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
  const sheetName = workbook.SheetNames[0] || 'Sheet1';
  const firstSheet = workbook.Sheets[sheetName];
  if (!firstSheet) return [];
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
    const files = req.files as Record<string, Express.Multer.File[]>;

    const hibidFile = files.hibid?.[0];
    const afFile = files.auctionflex?.[0];
    const mfFile = files.manyfast?.[0];

    if (!hibidFile || !afFile || !mfFile) {
      return res.status(400).json({ error: 'All 3 files are required: hibid, auctionflex, manyfast' });
    }

    const [hibidData, auctionflexData, manyfastData] = await Promise.all([
      parseFile(hibidFile.path, hibidFile.originalname),
      parseFile(afFile.path, afFile.originalname),
      parseFile(mfFile.path, mfFile.originalname),
    ]);

    const validateHeaders = (rows: any[], requiredAliases: string[][], filename: string): string | null => {
      if (!rows || rows.length === 0) {
        return `File ${filename} is empty.`;
      }
      const sampleRow = rows[0];
      const keys = Object.keys(sampleRow).map(k => k.trim());
      
      for (const group of requiredAliases) {
        const match = group.some(alias => keys.includes(alias));
        if (!match) {
          return `Missing required column in ${filename}. Expected one of: ${group.join(', ')}`;
        }
      }
      return null;
    };

    const hibidValidation = validateHeaders(hibidData, [['Lot'], ['Winning Bidder', 'Bidder', 'Bidder Number', 'BidderNumber'], ['High Bid', 'Winning Amount', 'Hammer Price', 'Hammer']], 'HiBid Results');
    const afValidation = validateHeaders(auctionflexData, [['BidderNumber', 'Bidder Number', 'BidderNum', 'Bidder'], ['FirstName', 'First Name', 'LastName', 'Last Name', 'Name', 'Customer Name', 'FullName']], 'AuctionFlex Bidders');
    const mfValidation = validateHeaders(manyfastData, [['Lot+Section', 'Lot', 'Lot Number', 'LotNumber'], ['Location', 'Storage Location', 'StorageLocation', 'Bin', 'Rack']], 'ManyFastScan Catalog');

    if (hibidValidation || afValidation || mfValidation) {
      const errors = [hibidValidation, afValidation, mfValidation].filter(Boolean);
      return res.status(400).json({ error: 'Validation failed', details: errors.join('; ') });
    }

    // Fetch custom defaults from Settings collection
    const bpSetting = await Settings.findOne({ key: 'buyer_premium' });
    const trSetting = await Settings.findOne({ key: 'tax_rate' });
    const buyerPremiumRate = bpSetting ? parseFloat(bpSetting.value) : 0.15;
    const taxRate = trSetting ? parseFloat(trSetting.value) : 0.13;

    const uploadedFilesList = [
      hibidFile.originalname,
      afFile.originalname,
      mfFile.originalname
    ];
    const auctionRun = new AuctionRun({ 
      auctionNumber, 
      title: auctionTitle,
      uploadedFiles: uploadedFilesList
    });
    await auctionRun.save();

    // ── 1. Process AuctionFlex Bidders (Source of Truth for Identity) ─────────
    const bidderNumbers = auctionflexData.map(b => getField(b, 'BidderNumber', 'Bidder Number')).filter(Boolean);
    const existingCustomers = await Customer.find({ bidderNumber: { $in: bidderNumbers } });
    const existingCustomerMap = new Map(existingCustomers.map(c => [c.bidderNumber, c]));

    const bidderMap = new Map<string, any>(); 
    const customerBulkOps: any[] = [];

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

      const metadata: any = { ...b };
      
      let customer = existingCustomerMap.get(bidderNum);
      const isNewCustomer = !customer;
      
      if (!customer) {
        customer = new Customer({ bidderNumber: bidderNum });
      }

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

      bidderMap.set(bidderNum, customer);

      // Using lean objects for update/insert payload to avoid mongoose overhead in bulkWrite
      const custObj = customer.toObject();
      delete (custObj as any)._id; // Ensure we don't try to overwrite immutable _id in updates

      if (isNewCustomer) {
        customerBulkOps.push({
          insertOne: { document: customer }
        });
      } else {
        customerBulkOps.push({
          updateOne: {
            filter: { _id: customer._id },
            update: { $set: custObj }
          }
        });
      }
    }

    if (customerBulkOps.length > 0) {
      await Customer.bulkWrite(customerBulkOps);
    }

    // ── 2. Build ManyFast Index (Lot Details) ────────────────────────────────
    const manyfastMap = new Map<string, any>();

    for (const m of manyfastData) {
      const lotId = getField(m, 'Lot+Section', 'Lot'); 
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
    const newLots: any[] = [];

    for (const h of hibidData) {
      const lotNum = getField(h, 'Lot');
      const winningBidder = getField(h, 'Winning Bidder');
      if (!lotNum || !winningBidder) continue;

      let order = ordersMap.get(winningBidder);
      if (!order) {
        const customer = bidderMap.get(winningBidder);
        if (!customer) continue;

        const initialRetrieval = customer.isShippingRequested ? 'Shipping' : 'Awaiting Choice';
        const initialStatus = customer.isShippingRequested ? 'Shipping Selected' : 'Awaiting Choice';

        order = new Order({
          auctionRun: auctionRun._id,
          bidderNumber: winningBidder,
          customer: customer._id,
          bookingCode: `BB-${auctionNumber}-${winningBidder}`,
          retrievalMethod: initialRetrieval,
          customerStatus: initialStatus,
          lifecycleStatus: customer.isShippingRequested ? 'Shipping' : 'Imported',
          pickupStatus: 'Not Booked',
          prepStatus: 'Not Started',
          paymentStatus: 'Unknown',
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
        ordersMap.set(winningBidder, order);
      }

      const manifest = manyfastMap.get(lotNum);
      const sourceLocation = manifest?.location || 'TBD';
      const type = sourceLocation.startsWith('B') ? 'Sort' : 'Non-Sort';

      const hammerPrice = parseFloat(getField(h, 'High Bid', 'Winning Amount', 'Hammer Price').replace('$', '').replace(/,/g, '')) || 0;
      const buyerPremiumPortion = Math.round(hammerPrice * buyerPremiumRate * 100) / 100;
      const taxPortion = Math.round((hammerPrice + buyerPremiumPortion) * taxRate * 100) / 100;

      const lot = new Lot({
        order: order._id,
        auctionRun: auctionRun._id,
        lotNumber: lotNum,
        manifestItemId: manifest?.manifestItemId || '',
        lpn: manifest?.lpn || '',
        description: manifest?.title || getField(h, 'Title') || 'No description',
        sourceLocation,
        type,
        hammerPrice,
        buyerPremiumPortion,
        taxPortion,
        retailPrice: manifest?.retailPrice || 0,
        retailerUrl: manifest?.retailerUrl || '',
        qty: manifest?.qty || 1,
        internalSku: manifest?.internalSku || '',
        metadata: manifest?.raw || {}
      });
      newLots.push(lot);
    }

    if (ordersMap.size > 0) {
      await Order.insertMany(Array.from(ordersMap.values()));
    }
    
    if (newLots.length > 0) {
      await Lot.insertMany(newLots);
    }

    // ── 4. Calculate Order Financial Totals ─────────────────────────────────
    const orderBulkOps: any[] = [];
    
    const totals = await Lot.aggregate([
      { $match: { auctionRun: auctionRun._id } },
      { $group: {
          _id: "$order",
          totalHammer: { $sum: "$hammerPrice" },
          totalLots: { $sum: 1 }
      }}
    ]);

    for (const t of totals) {
      const totalHammer = t.totalHammer || 0;
      const buyerPremium = Math.round(totalHammer * buyerPremiumRate * 100) / 100;
      const taxAmount = Math.round((totalHammer + buyerPremium) * taxRate * 100) / 100;
      const unpaidBalance = Math.round((totalHammer + buyerPremium + taxAmount) * 100) / 100;

      orderBulkOps.push({
        updateOne: {
          filter: { _id: t._id },
          update: {
            $set: {
              totalLots: t.totalLots,
              totalHammer,
              buyerPremium,
              taxAmount,
              unpaidBalance,
              paidAmount: 0,
              paymentStatus: 'Unpaid'
            }
          }
        }
      });
    }

    if (orderBulkOps.length > 0) {
      await Order.bulkWrite(orderBulkOps);
    }

    // ── 5. Update Stats ──────────────────────────────────────────────────────
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
      metadata: { orderCount: ordersMap.size, lotCount: newLots.length }
    });

    res.json({
      success: true,
      stats: {
        ordersCreated: ordersMap.size,
        lotsCreated: newLots.length,
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

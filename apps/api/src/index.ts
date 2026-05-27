import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import path from 'path';
import dotenv from 'dotenv';

// Load env from root
dotenv.config({ path: path.join(__dirname, '../../../.env') });

import auctionRouter from './routes/auctions';
import importRouter from './routes/import';
import lotRouter from './routes/lots';
import notificationRouter from './routes/notifications';
import orderRouter from './routes/orders';
import slotRouter from './routes/slots';
import shippingRouter from './routes/shipping';
import caseRouter from './routes/cases';
import activityRouter from './routes/activity';
import creditsRouter from './routes/credits';
import settingsRouter from './routes/settings';

const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.DB_URI;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.use('/api/auctions', auctionRouter);
app.use('/api/import', importRouter);
app.use('/api/lots', lotRouter);
app.use('/api/notifications', notificationRouter);
app.use('/api/orders', orderRouter);
app.use('/api/slots', slotRouter);
app.use('/api/shipping', shippingRouter);
app.use('/api/cases', caseRouter);
app.use('/api/activities', activityRouter);
app.use('/api/credits', creditsRouter);
app.use('/api/settings', settingsRouter);

app.get('/', (req, res) => {
  res.send('Warehouse Pickup API is running');
});

if (!MONGODB_URI) {
  console.error('Error: DB_URI is not defined in .env');
  process.exit(1);
}

mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
  });

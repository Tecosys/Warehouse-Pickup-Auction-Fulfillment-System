import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import path from 'path';

import importRouter from './routes/import';
import notificationRouter from './routes/notifications';
import orderRouter from './routes/orders';
import slotRouter from './routes/slots';

const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.DB_URI;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/import', importRouter);
app.use('/api/notifications', notificationRouter);
app.use('/api/orders', orderRouter);
app.use('/api/slots', slotRouter);

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

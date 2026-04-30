import Notification from '../models/Notification';
import Order from '../models/Order';
import Customer from '../models/Customer';

const TEMPLATES: Record<number, string> = {
  1: "Congratulations on your winnings from Bid Boss Auction #{auctionNumber}. Please use your link to choose Pickup or Shipping: {link}",
  2: "Your order has been marked for shipping. Once your order is ready, you will receive your invoice / shipping update shortly.",
  3: "Your order is now ready. If not already booked, please use your link to choose a pickup time or select shipping: {link}",
  4: "Your pickup is confirmed for {date} at {time}. Booking code: {code}. Use the same link to reschedule up to 2 hours before.",
  10: "This confirms your order was picked up on {date} at {time}. For Grade A/B lots, report functionality issues within 24h to support@bidbossinc.ca.",
  13: "Your order from Bid Boss Auction #{auctionNumber} has been shipped. Tracking number: {trackingNumber}"
};

export class NotificationService {
  static async send(orderId: string, type: number, extraData: any = {}) {
    try {
      const order: any = await Order.findById(orderId).populate('customer').populate('auctionRun');
      if (!order) throw new Error('Order not found');

      const template = TEMPLATES[type];
      if (!template) throw new Error(`Template for type ${type} not found`);

      // Simple interpolation
      let content = template
        .replace('{auctionNumber}', order.auctionRun?.auctionNumber || 'N/A')
        .replace('{link}', `https://portal.bidboss.ca/order/${order.bookingCode}`)
        .replace('{date}', extraData.date || '')
        .replace('{time}', extraData.time || '')
        .replace('{code}', order.bookingCode || '')
        .replace('{trackingNumber}', extraData.trackingNumber || '');

      // Create log
      const notification = new Notification({
        order: order._id,
        customer: order.customer._id,
        type,
        name: `Notification #${type}`,
        content,
        status: 'Sent', // MOCKED for Phase 1
        sentAt: new Date()
      });

      await notification.save();
      console.log(`[Notification Service] Sent type ${type} to ${order.customer.name}`);
      
      return notification;
    } catch (error) {
      console.error('Failed to send notification:', error);
      throw error;
    }
  }

  static async sendBatch(auctionRunId: string, type: number) {
    const orders = await Order.find({ auctionRun: auctionRunId });
    const results = [];
    for (const order of orders) {
      results.push(await this.send(order._id.toString(), type));
    }
    return results;
  }
}

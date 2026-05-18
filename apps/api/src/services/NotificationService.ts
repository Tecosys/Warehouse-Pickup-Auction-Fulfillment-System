import Notification from '../models/Notification';
import Order from '../models/Order';
import Case from '../models/Case';
import Settings from '../models/Settings';
import twilio from 'twilio';
import { Resend } from 'resend';

// Clients are lazy-loaded to prevent ES Module hoisting issues where process.env is not defined yet
let twilioClient: any = null;
const getTwilioClient = () => {
  if (twilioClient) return twilioClient;
  if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
    twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
  }
  return twilioClient;
};

let resendClient: any = null;
const getResendClient = () => {
  if (resendClient) return resendClient;
  if (process.env.RESEND_API_KEY) {
    resendClient = new Resend(process.env.RESEND_API_KEY);
  }
  return resendClient;
};

const TEMPLATES: Record<number, string> = {
  1: "Congratulations on your winnings from Bid Boss Auction #{auctionNumber}. Please use your link to choose Pickup or Shipping: {link}",
  2: "Your order has been marked for shipping. Once your order is ready, you will receive your invoice / shipping update shortly. Please note that once shipping is selected, this choice cannot later be changed back to pickup online.",
  3: "Your order is now ready. If not already booked, please use your link to choose a pickup time or select shipping: {link}",
  4: "Your pickup is confirmed for {date} at {time}. Booking code: {code}. Use the same link to reschedule up to 2 hours before.",
  5: "Reminder: your Bid Boss pickup is scheduled for {date} at {time}. Booking code: {code}. If needed, use your link to reschedule up to 2 hours before.",
  6: "Your pickup window begins in 1 hour. Booking code: {code}. Entrance is at the back through the side bay door.",
  7: "Please use your link to choose Pickup or Shipping for your order: {link}",
  8: "Final reminder: your order must be scheduled for pickup or marked for shipping today before the deadline. Link: {link}",
  9: "Your order has been cancelled due to no pickup / no shipping action before the deadline. If you have already communicated with us and this needs review, please contact support.",
  10: "This confirms your order was picked up on {date} at {time}. For eligible Grade A and Grade B lots, any functionality issue must be reported within 24 hours from the time this message was sent to support@bidbossinc.ca.",
  11: "Hello, this confirms that Lot #{lotNumber} from Auction #{auctionNumber} has been received back by Bid Boss. Your case is now under review. Please allow time for assessment.",
  12: "Thank you for choosing Bid Boss. If everything went well, we would sincerely appreciate a quick Google review: {reviewLink}",
  13: "Your order from Bid Boss Auction #{auctionNumber} has been shipped. Tracking number: {trackingNumber}"
};

export class NotificationService {
  static async send(orderId: string, type: number, extraData: any = {}) {
    try {
      const order: any = await Order.findById(orderId).populate('customer').populate('auctionRun');
      if (!order) throw new Error('Order not found');

      // Safety check for Review Request (Type 12)
      if (type === 12) {
        const openCase = await Case.findOne({ order: orderId, status: { $ne: 'Resolved' } });
        if (openCase) {
          console.log(`[Notification Service] Skipping review request for order ${orderId} due to open case.`);
          return null;
        }
      }

      const template = TEMPLATES[type];
      if (!template) throw new Error(`Template for type ${type} not found`);

      // Fetch dynamic review link if needed
      let reviewLink = "https://g.page/r/bidboss/review"; 
      if (type === 12) {
        const setting = await Settings.findOne({ key: 'google_review_link' });
        if (setting) reviewLink = setting.value;
      }

      // Simple interpolation
      let content = template
        .replace(/{auctionNumber}/g, order.auctionRun?.auctionNumber || 'N/A')
        .replace(/{link}/g, `https://portal.bidboss.ca/order/${order.bookingCode}`)
        .replace(/{date}/g, extraData.date || '')
        .replace(/{time}/g, extraData.time || '')
        .replace(/{code}/g, order.bookingCode || '')
        .replace(/{lotNumber}/g, extraData.lotNumber || '')
        .replace(/{reviewLink}/g, reviewLink)
        .replace(/{trackingNumber}/g, extraData.trackingNumber || '');

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
      
      // Attempt to send via Twilio SMS
      const activeTwilioClient = getTwilioClient();
      if (activeTwilioClient && process.env.TWILIO_FROM_NUMBER && process.env.TWILIO_FROM_NUMBER !== 'pending') {
        const phone = order.customer.phone;
        if (phone) {
          try {
            await activeTwilioClient.messages.create({
              body: content,
              from: process.env.TWILIO_FROM_NUMBER,
              to: phone
            });
            console.log(`[Notification Service] Twilio SMS sent to ${phone}`);
          } catch (smsError) {
            console.error(`[Notification Service] Twilio SMS failed to send to ${phone}:`, smsError);
          }
        } else {
          console.log(`[Notification Service] Customer has no phone number, skipped Twilio SMS.`);
        }
      } else {
        console.log(`[Notification Service] Twilio SMS skipped - missing client, from number, or still pending review.`);
      }

      // Attempt to send via Resend Email
      const activeResendClient = getResendClient();
      if (activeResendClient && process.env.RESEND_FROM_EMAIL) {
        const email = order.customer.email;
        if (email) {
          try {
            await activeResendClient.emails.send({
              from: process.env.RESEND_FROM_EMAIL,
              to: email,
              subject: `Bid Boss Update - Auction #${order.auctionRun?.auctionNumber || 'N/A'}`,
              text: content,
              replyTo: process.env.RESEND_REPLY_TO || undefined
            });
            console.log(`[Notification Service] Resend Email sent to ${email}`);
          } catch (emailError) {
            console.error(`[Notification Service] Resend Email failed to send to ${email}:`, emailError);
          }
        } else {
          console.log(`[Notification Service] Customer has no email address, skipped Resend Email.`);
        }
      } else {
        console.log(`[Notification Service] Resend Email skipped - missing client or from email.`);
      }

      return notification;
    } catch (error) {
      console.error('Failed to send notification:', error);
      throw error;
    }
  }

  static async sendBatch(auctionRunId: string, type: number, options: { bidderNumber?: string; noChoiceOnly?: boolean } = {}) {
    const query: any = { auctionRun: auctionRunId };
    
    if (options.bidderNumber) {
      query.bidderNumber = options.bidderNumber;
    }
    if (options.noChoiceOnly) {
      query.customerStatus = 'Awaiting Choice';
    }

    const orders = await Order.find(query);
    console.log(`[Notification Service] Found ${orders.length} order(s) matching query for batch. Sending...`);
    const results = [];
    for (const order of orders) {
      const res = await this.send(order._id.toString(), type);
      if (res) results.push(res);
    }
    return results;
  }
}

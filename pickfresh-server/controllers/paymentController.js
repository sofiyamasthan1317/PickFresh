const stripe = require("stripe")(process.env.STRIPE_SECRET || "sk_test_mock_secret");
const Order = require("../models/Order");
const Notification = require("../models/Notification");
const { sendSuccess } = require("../utils/responseHandler");

// POST /api/payments/create-intent
const createPaymentIntent = async (req, res, next) => {
  try {
    const { orderId } = req.body;
    const order = await Order.findOne({ _id: orderId, user: req.user._id });

    if (!order) {
      res.status(404);
      throw new Error("Order not found");
    }

    // Stripe expects amount in cents/paise
    const amountInPaise = Math.round(order.totalAmount * 100);

    // Create payment intent with order metadata
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInPaise,
      currency: "inr",
      metadata: { orderId: order._id.toString(), orderNumber: order.orderId },
      payment_method_types: ["card"],
    });

    sendSuccess(res, "Payment intent created successfully", {
      clientSecret: paymentIntent.client_secret,
      id: paymentIntent.id,
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/payments/webhook
const stripeWebhook = async (req, res, next) => {
  const sig = req.headers["stripe-signature"];
  let event;

  try {
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    
    // For development, if webhookSecret is missing, allow dry-run mock webhook processing
    if (!webhookSecret || webhookSecret === "whsec_mock") {
      const payload = JSON.parse(req.body.toString());
      event = payload;
    } else {
      event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    }
  } catch (err) {
    res.status(400);
    return next(new Error(`Webhook Signature Error: ${err.message}`));
  }

  // Handle succeeded payments
  if (event.type === "payment_intent.succeeded") {
    const paymentIntent = event.data.object;
    const orderId = paymentIntent.metadata.orderId;

    if (orderId) {
      const order = await Order.findById(orderId);
      if (order) {
        order.paymentStatus = "Paid";
        order.orderStatus = "Confirmed";
        order.statusHistory.push({
          status: "Confirmed",
          note: `Paid successfully via Stripe Card. Intent ID: ${paymentIntent.id}`,
        });
        await order.save();

        // Notify user
        await Notification.create({
          user: order.user,
          title: "Payment Received 💳",
          message: `Your payment of ₹${order.totalAmount} for order ${order.orderId} was successful!`,
          type: "order",
          refId: order.orderId,
        });
      }
    }
  }

  res.json({ received: true });
};

module.exports = {
  createPaymentIntent,
  stripeWebhook,
};

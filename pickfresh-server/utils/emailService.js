const axios = require("axios");

const sendEmail = async ({ to, subject, html }) => {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM || "PickFresh <onboarding@resend.dev>";

  if (!apiKey || apiKey === "re_mock_key_for_development") {
    console.log(`\n✉️  [MOCK EMAIL] To: ${to}\nSubject: ${subject}\nBody:\n${html}\n`);
    return { success: true, mock: true };
  }

  try {
    const response = await axios.post(
      "https://api.resend.com/emails",
      {
        from,
        to: [to],
        subject,
        html,
      },
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("❌ Email sending failed via Resend:", error.response?.data || error.message);
    throw new Error("Failed to send email notification");
  }
};

const getOtpTemplate = (otp, purpose) => {
  const action = purpose === "forgot-password" ? "reset your password" : "verify your email address";
  return `
    <div style="font-family: sans-serif; padding: 20px; color: #17201a; background-color: #f8faf7;">
      <h2 style="color: #2c9855;">PickFresh Security Verification</h2>
      <p>Hello,</p>
      <p>You requested a code to ${action} for your PickFresh account.</p>
      <div style="font-size: 24px; font-weight: bold; background: #eef7ef; padding: 15px; text-align: center; border-radius: 8px; margin: 20px 0; color: #1a7040; letter-spacing: 2px;">
        ${otp}
      </div>
      <p>This code is valid for 10 minutes. If you did not make this request, please secure your account immediately.</p>
      <hr style="border: none; border-top: 1px solid #dbe6d6; margin-top: 30px;" />
      <p style="font-size: 12px; color: #647467;">PickFresh Premium Organic Market</p>
    </div>
  `;
};

const getWelcomeTemplate = (name) => {
  return `
    <div style="font-family: sans-serif; padding: 20px; color: #17201a; background-color: #f8faf7;">
      <h2 style="color: #2c9855;">Welcome to PickFresh, ${name}! 🥬</h2>
      <p>We are thrilled to have you join our premium organic marketplace.</p>
      <p>You can now shop market-fresh produce, plan your weekly grocery basket with AI assistance, and track deliveries straight to your door.</p>
      <p style="margin-top: 20px;"><a href="${process.env.CLIENT_URL || 'http://localhost:5173'}" style="background-color: #2c9855; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Start Shopping</a></p>
      <hr style="border: none; border-top: 1px solid #dbe6d6; margin-top: 30px;" />
      <p style="font-size: 12px; color: #647467;">PickFresh Premium Organic Market</p>
    </div>
  `;
};

const getPasswordChangedTemplate = () => {
  return `
    <div style="font-family: sans-serif; padding: 20px; color: #17201a; background-color: #f8faf7;">
      <h2 style="color: #c2410c;">Security Notification</h2>
      <p>Hello,</p>
      <p>The password for your PickFresh account was successfully updated.</p>
      <p>If you did not make this change, please contact support immediately to lock your account.</p>
      <hr style="border: none; border-top: 1px solid #dbe6d6; margin-top: 30px;" />
      <p style="font-size: 12px; color: #647467;">PickFresh Premium Organic Market</p>
    </div>
  `;
};

const getOrderConfirmationTemplate = (order) => {
  const itemsHtml = order.products
    .map(
      (item) => `
    <tr>
      <td style="padding: 8px; border-bottom: 1px solid #dbe6d6;">${item.name} x ${item.quantity}</td>
      <td style="padding: 8px; border-bottom: 1px solid #dbe6d6; text-align: right;">₹${(item.price * item.quantity).toFixed(2)}</td>
    </tr>
  `
    )
    .join("");

  return `
    <div style="font-family: sans-serif; padding: 20px; color: #17201a; background-color: #f8faf7;">
      <h2 style="color: #2c9855;">Order Confirmed! 🎉</h2>
      <p>Thank you for shopping with PickFresh. Your order is being processed.</p>
      <p><strong>Order ID:</strong> ${order.orderId}</p>
      <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
        <thead>
          <tr style="background-color: #eef7ef; text-align: left;">
            <th style="padding: 8px;">Item</th>
            <th style="padding: 8px; text-align: right;">Price</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHtml}
          <tr>
            <td style="padding: 8px; font-weight: bold;">Grand Total</td>
            <td style="padding: 8px; font-weight: bold; text-align: right;">₹${order.totalAmount.toFixed(2)}</td>
          </tr>
        </tbody>
      </table>
      <p style="margin-top: 25px;"><a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/orders/${order.orderId}" style="background-color: #2c9855; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Track Your Order</a></p>
      <hr style="border: none; border-top: 1px solid #dbe6d6; margin-top: 30px;" />
      <p style="font-size: 12px; color: #647467;">PickFresh Premium Organic Market</p>
    </div>
  `;
};

const getOrderDeliveredTemplate = (order) => {
  return `
    <div style="font-family: sans-serif; padding: 20px; color: #17201a; background-color: #f8faf7;">
      <h2 style="color: #2c9855;">Order Delivered! 🧺</h2>
      <p>Your PickFresh order <strong>${order.orderId}</strong> has been successfully delivered.</p>
      <p>We hope you enjoy your fresh farm produce! Please rate your items and the delivery experience in your dashboard.</p>
      <hr style="border: none; border-top: 1px solid #dbe6d6; margin-top: 30px;" />
      <p style="font-size: 12px; color: #647467;">PickFresh Premium Organic Market</p>
    </div>
  `;
};

module.exports = {
  sendEmail,
  getOtpTemplate,
  getWelcomeTemplate,
  getPasswordChangedTemplate,
  getOrderConfirmationTemplate,
  getOrderDeliveredTemplate,
};

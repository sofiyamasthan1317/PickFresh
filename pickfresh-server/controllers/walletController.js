const asyncHandler = require("express-async-handler");
const mongoose = require("mongoose");
const Wallet = require("../models/Wallet");
const WalletTransaction = require("../models/WalletTransaction");
const { sendSuccess } = require("../utils/responseHandler");

// Helper to get or create a user's wallet
const getOrCreateWallet = async (userId) => {
  let wallet = await Wallet.findOne({ user: userId });
  if (!wallet) {
    wallet = await Wallet.create({ user: userId, balance: 0 });
  }
  return wallet;
};

const createWalletTransaction = async ({ wallet, user, type, amount, description, orderId = null, status = "completed" }) => {
  return WalletTransaction.create({
    wallet: wallet._id,
    user,
    type,
    amount,
    description,
    status,
    order: orderId,
  });
};

// GET /api/wallet
const getWalletSummary = asyncHandler(async (req, res) => {
  const wallet = await getOrCreateWallet(req.user._id);
  const { page = 1, limit = 5, type = "all" } = req.query;
  const numericPage = Math.max(Number(page), 1);
  const numericLimit = Math.min(Math.max(Number(limit), 1), 20);
  const skip = (numericPage - 1) * numericLimit;

  const filter = { wallet: wallet._id };
  if (type && type !== "all") filter.type = type;

  const [transactions, total] = await Promise.all([
    WalletTransaction.find(filter).sort({ createdAt: -1 }).skip(skip).limit(numericLimit),
    WalletTransaction.countDocuments(filter),
  ]);

  sendSuccess(res, "Wallet loaded successfully", {
    balance: wallet.balance,
    transactions,
    pagination: {
      total,
      page: numericPage,
      pages: Math.ceil(total / numericLimit),
      limit: numericLimit,
    },
  });
});

// GET /api/wallet/balance
const getWalletBalance = asyncHandler(async (req, res) => {
  const wallet = await getOrCreateWallet(req.user._id);
  sendSuccess(res, "Wallet balance retrieved successfully", { balance: wallet.balance });
});

// POST /api/wallet/add-money
const addMoney = asyncHandler(async (req, res) => {
  const { amount, description } = req.body;
  const numAmount = Number(amount);

  if (isNaN(numAmount) || numAmount <= 0) {
    res.status(400);
    throw new Error("Invalid deposit amount");
  }

  const wallet = await getOrCreateWallet(req.user._id);
  wallet.balance += numAmount;
  await wallet.save();

  const transaction = await createWalletTransaction({
    wallet,
    user: req.user._id,
    type: "credit",
    amount: numAmount,
    description: description || "Money added to wallet",
  });

  sendSuccess(res, "Money added to wallet successfully", {
    balance: wallet.balance,
    transaction,
  });
});

// POST /api/wallet/pay
const payWallet = asyncHandler(async (req, res) => {
  const { amount, description, orderId } = req.body;
  const normalizedOrderId = orderId && mongoose.Types.ObjectId.isValid(orderId) ? orderId : null;
  const numAmount = Number(amount);

  if (isNaN(numAmount) || numAmount <= 0) {
    res.status(400);
    throw new Error("Invalid payment amount");
  }

  const wallet = await getOrCreateWallet(req.user._id);
  if (wallet.balance < numAmount) {
    res.status(400);
    throw new Error("Insufficient wallet balance");
  }

  wallet.balance -= numAmount;
  await wallet.save();

  const transaction = await createWalletTransaction({
    wallet,
    user: req.user._id,
    type: "payment",
    amount: numAmount,
    description: description || "Wallet payment",
    orderId: normalizedOrderId,
  });

  sendSuccess(res, "Wallet payment completed successfully", {
    balance: wallet.balance,
    transaction,
  });
});

// GET /api/wallet/transactions
const getTransactionHistory = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, type = "all" } = req.query;
  const wallet = await getOrCreateWallet(req.user._id);

  const numericPage = Math.max(Number(page), 1);
  const numericLimit = Math.min(Math.max(Number(limit), 1), 50);
  const skip = (numericPage - 1) * numericLimit;

  const filter = { wallet: wallet._id };
  if (type && type !== "all") filter.type = type;

  const [transactions, total] = await Promise.all([
    WalletTransaction.find(filter).sort({ createdAt: -1 }).skip(skip).limit(numericLimit),
    WalletTransaction.countDocuments(filter),
  ]);

  sendSuccess(res, "Wallet transactions loaded successfully", {
    transactions,
    pagination: {
      total,
      page: numericPage,
      pages: Math.ceil(total / numericLimit),
      limit: numericLimit,
    },
  });
});

module.exports = {
  getOrCreateWallet,
  getWalletBalance,
  addMoney,
  payWallet,
  getTransactionHistory,
  getWalletSummary,
};

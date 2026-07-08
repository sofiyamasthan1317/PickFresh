const asyncHandler = require("express-async-handler");
const Conversation = require("../models/Conversation");
const Message = require("../models/Message");
const User = require("../models/UserModel");
const { sendSuccess } = require("../utils/responseHandler");
const socketHandler = require("../utils/socket");

const allowedPairs = [
  ["customer", "vendor"],
  ["customer", "delivery"],
  ["customer", "admin"],
  ["vendor", "admin"],
  ["delivery", "admin"],
];

const isAllowedPair = (senderRole, receiverRole) => allowedPairs.some(([a, b]) => (a === senderRole && b === receiverRole) || (a === receiverRole && b === senderRole));

const getConversations = asyncHandler(async (req, res) => {
  const conversations = await Conversation.find({ participants: req.user._id })
    .populate("participants", "_id name role")
    .sort({ lastMessageAt: -1 })
    .lean();

  const safe = conversations.map((conversation) => ({
    ...conversation,
    participants: conversation.participants.filter((participant) => participant._id.toString() !== req.user._id.toString()),
  }));

  sendSuccess(res, "Conversations loaded", safe);
});

const getMessages = asyncHandler(async (req, res) => {
  const conversation = await Conversation.findById(req.params.conversationId);
  if (!conversation) {
    res.status(404);
    throw new Error("Conversation not found");
  }

  const messages = await Message.find({ conversation: conversation._id }).sort({ createdAt: 1 }).lean();
  sendSuccess(res, "Messages loaded", messages);
});

const sendMessage = asyncHandler(async (req, res) => {
  const { receiverId, message, messageType = "text", image = "", file = "" } = req.body;
  if (!receiverId || !message?.trim()) {
    res.status(400);
    throw new Error("Receiver and message are required");
  }

  const receiver = await User.findById(receiverId);
  if (!receiver) {
    res.status(404);
    throw new Error("Receiver not found");
  }

  if (!isAllowedPair(req.user.role, receiver.role)) {
    res.status(400);
    throw new Error("This chat channel is not supported");
  }

  const participants = [req.user._id, receiver._id].sort((a, b) => a.toString().localeCompare(b.toString()));
  let conversation = await Conversation.findOne({ participants: { $all: participants } });

  if (!conversation) {
    conversation = await Conversation.create({ participants, lastMessage: message, lastMessageAt: new Date(), unreadBy: [receiver._id] });
  } else {
    conversation.lastMessage = message;
    conversation.lastMessageAt = new Date();
    conversation.unreadBy = [...new Set([...(conversation.unreadBy || []), receiver._id])];
    await conversation.save();
  }

  const createdMessage = await Message.create({
    conversation: conversation._id,
    sender: req.user._id,
    receiver: receiver._id,
    message,
    messageType,
    image,
    file,
    isSeen: false,
  });

  socketHandler.sendToUser(receiver._id, "chat-message", {
    conversationId: conversation._id,
    message: createdMessage,
  });
  socketHandler.sendToUser(receiver._id, "notification", {
    _id: createdMessage._id,
    title: "New message",
    message: message.slice(0, 80),
    type: "chat",
    isRead: false,
    createdAt: createdMessage.createdAt,
  });

  sendSuccess(res, "Message sent", createdMessage, 201);
});

const readMessage = asyncHandler(async (req, res) => {
  const message = await Message.findById(req.params.id);
  if (!message) {
    res.status(404);
    throw new Error("Message not found");
  }
  if (message.receiver.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error("Not authorized");
  }
  message.isSeen = true;
  await message.save();
  sendSuccess(res, "Message marked as read", message);
});

const deleteMessage = asyncHandler(async (req, res) => {
  const message = await Message.findById(req.params.id);
  if (!message) {
    res.status(404);
    throw new Error("Message not found");
  }
  if (message.sender.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error("Not authorized");
  }
  await message.deleteOne();
  sendSuccess(res, "Message deleted");
});

module.exports = { getConversations, getMessages, sendMessage, readMessage, deleteMessage };

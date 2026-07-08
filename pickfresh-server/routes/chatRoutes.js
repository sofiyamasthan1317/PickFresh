const express = require("express");
const { body, param } = require("express-validator");
const { protect } = require("../middleware/authMiddleware");
const validateRequest = require("../middleware/validateRequest");
const { getConversations, getMessages, sendMessage, readMessage, deleteMessage } = require("../controllers/chatController");

const router = express.Router();
router.use(protect);

router.get("/conversations", getConversations);
router.get("/messages/:conversationId", [param("conversationId").isMongoId().withMessage("Valid conversation id required")], validateRequest, getMessages);
router.post("/send", [body("receiverId").isMongoId().withMessage("Valid receiver id required"), body("message").trim().notEmpty().withMessage("Message is required")], validateRequest, sendMessage);
router.patch("/message/:id/read", [param("id").isMongoId().withMessage("Valid message id required")], validateRequest, readMessage);
router.delete("/message/:id", [param("id").isMongoId().withMessage("Valid message id required")], validateRequest, deleteMessage);

module.exports = router;

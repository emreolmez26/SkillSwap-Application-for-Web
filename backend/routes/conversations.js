const express = require("express");
const router = express.Router();
const Conversation = require("../models/conversation");
const Message = require("../models/message");
const User = require("../models/user");

// GET /api/conversations - Kullanıcının tüm konuşmalarını getir
router.get("/", async (req, res) => {
  try {
    const { userId } = req.query; // Giriş yapan kullanıcının ID'si

    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    const conversations = await Conversation.find({
      participants: userId,
    })
      .populate("participants", "username")
      .populate({
        path: "lastMessage",
        populate: {
          path: "sender",
          select: "username",
        },
      })
      .sort({ lastMessageTime: -1 });

    res.json(conversations);
  } catch (error) {
    console.error("Error fetching conversations:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// GET /api/conversations/:id/messages - Belirli konuşmanın mesajlarını getir
router.get("/:id/messages", async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 50 } = req.query;

    const messages = await Message.find({ conversation: id })
      .populate("sender", "username")
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    res.json(messages.reverse()); // En eski mesajdan en yeniye sırala
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// POST /api/conversations/:id/messages - Yeni mesaj gönder
router.post("/:id/messages", async (req, res) => {
  try {
    const { id } = req.params; // conversation ID
    const { senderId, content } = req.body;

    if (!senderId || !content) {
      return res
        .status(400)
        .json({ message: "Sender ID and content are required" });
    }

    // Yeni mesaj oluştur
    const newMessage = new Message({
      conversation: id,
      sender: senderId,
      content: content.trim(),
    });

    await newMessage.save();

    // Conversation'ı güncelle
    await Conversation.findByIdAndUpdate(id, {
      lastMessage: newMessage._id,
      lastMessageTime: new Date(),
    });

    // Mesajı populate et
    const populatedMessage = await Message.findById(newMessage._id).populate(
      "sender",
      "username"
    );

    res.status(201).json(populatedMessage);
  } catch (error) {
    console.error("Error sending message:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// POST /api/conversations - Yeni konuşma başlat
router.post("/", async (req, res) => {
  try {
    const { participants } = req.body; // [userId1, userId2]

    if (!participants || participants.length !== 2) {
      return res
        .status(400)
        .json({ message: "Exactly 2 participants required" });
    }

    // Zaten var olan konuşma var mı kontrol et
    const existingConversation = await Conversation.findOne({
      participants: { $all: participants },
    }).populate("participants", "username");

    if (existingConversation) {
      return res.json(existingConversation);
    }

    // Yeni konuşma oluştur
    const newConversation = new Conversation({
      participants: participants,
    });

    await newConversation.save();

    const populatedConversation = await Conversation.findById(
      newConversation._id
    ).populate("participants", "username");

    res.status(201).json(populatedConversation);
  } catch (error) {
    console.error("Error creating conversation:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;

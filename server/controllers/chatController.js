const mongoose = require('mongoose');
const Chat = require('../models/Chat');

const AI_ASSISTANT_ID = new mongoose.Types.ObjectId('000000000000000000000000');

const getParticipantIds = (userId, otherUserId) => {
  const normalizedOtherUserId = otherUserId === 'ai-assistant' ? AI_ASSISTANT_ID : new mongoose.Types.ObjectId(otherUserId);
  return [new mongoose.Types.ObjectId(userId), normalizedOtherUserId].sort();
};

exports.getOrCreateChat = async (req, res) => {
  try {
    const { otherUserId } = req.body;

    if (!otherUserId) {
      return res.status(400).json({ success: false, message: 'otherUserId is required' });
    }

    const participantIds = getParticipantIds(req.user.id, otherUserId);

    let chat = await Chat.findOne({
      isGroupChat: false,
      participants: { $all: participantIds, $size: 2 },
    })
      .populate('participants', 'name role email')
      .sort({ updatedAt: -1 });

    if (!chat) {
      chat = await Chat.create({
        participants: participantIds,
        messages: [],
        isGroupChat: false,
      });

      chat = await chat.populate('participants', 'name role email');
    }

    res.status(200).json({ success: true, chat });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Unable to create or fetch chat' });
  }
};

exports.getMyChats = async (req, res) => {
  try {
    const chats = await Chat.find({ participants: req.user.id })
      .populate('participants', 'name role email')
      .sort({ updatedAt: -1 });

    res.status(200).json({ success: true, chats });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Unable to fetch chats' });
  }
};

exports.sendMessage = async (req, res) => {
  try {
    const { chatId } = req.params;
    const { text } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({ success: false, message: 'Message text is required' });
    }

    const chat = await Chat.findById(chatId);

    if (!chat || !chat.participants.some((participant) => participant.toString() === req.user.id.toString())) {
      return res.status(404).json({ success: false, message: 'Chat not found' });
    }

    chat.messages.push({ sender: req.user.id, text: text.trim(), sentAt: new Date() });
    chat.updatedAt = new Date();
    await chat.save();

    const populatedChat = await Chat.findById(chatId).populate('participants', 'name role email');

    res.status(200).json({ success: true, chat: populatedChat });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Unable to send message' });
  }
};

exports.getChatHistory = async (req, res) => {
  try {
    const { chatId } = req.params;
    const limit = Number(req.query.limit) || 50;
    const cursor = req.query.cursor || null;

    const chat = await Chat.findById(chatId);

    if (!chat || !chat.participants.some((participant) => participant.toString() === req.user.id.toString())) {
      return res.status(404).json({ success: false, message: 'Chat not found' });
    }

    const messages = [...chat.messages].sort((a, b) => new Date(a.sentAt) - new Date(b.sentAt));

    let startIndex = messages.length - limit;
    if (cursor) {
      const cursorIndex = messages.findIndex((message) => message.sentAt.toISOString() === cursor);
      if (cursorIndex !== -1) {
        startIndex = cursorIndex;
      }
    }

    const visibleMessages = messages.slice(Math.max(0, startIndex));
    const nextCursor = visibleMessages.length > 0 && startIndex + visibleMessages.length < messages.length
      ? visibleMessages[0].sentAt.toISOString()
      : null;

    res.status(200).json({ success: true, messages: visibleMessages, nextCursor });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Unable to fetch chat history' });
  }
};

const User = require('../models/User');
const Leave = require('../models/Leave');
const Attendance = require('../models/Attendance');
const ChatbotMessage = require('../models/ChatbotMessage');

const FALLBACK_MESSAGE = 'The HR assistant is temporarily unavailable. Please try again later or contact your manager.';

const getUserContext = async (userId) => {
  const [user, leaves, attendance] = await Promise.all([
    User.findById(userId).select('name role department leaveBalance'),
    Leave.find({ userId }).sort({ fromDate: -1 }).limit(10).select('type fromDate toDate days status'),
    Attendance.find({ userId }).sort({ date: -1 }).limit(10).select('date status workingHours'),
  ]);

  return JSON.stringify({
    user: user ? { name: user.name, role: user.role, leaveBalance: user.leaveBalance } : null,
    recentLeave: leaves,
    recentAttendance: attendance,
  });
};

const callGemini = async (message, context, history) => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return FALLBACK_MESSAGE;

  const model = process.env.GEMINI_MODEL || 'gemini-2.5-flash-lite';
  const contents = history.map((item) => ({ role: item.role, parts: [{ text: item.text }] }));
  contents.push({ role: 'user', parts: [{ text: message }] });
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(apiKey)}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: `You are WorkTrack's friendly AI assistant. Reply naturally to casual messages such as hi, hello, good morning, how are you, and thank you. Keep casual replies warm and brief. Help users with WorkTrack features, HR questions, attendance, leave balance, tasks, teams, workplace guidance, and explain the next useful step when appropriate. Use the private user context only to answer this user's question. Never invent company policy, claim an action was completed when it was not, or expose private data. If a request is unclear, ask one short clarifying question. User context: ${context}` }] },
      contents,
      generationConfig: { temperature: 0.3, maxOutputTokens: 500 },
    }),
  });

  if (!response.ok) throw new Error(`Gemini request failed with status ${response.status}`);
  const payload = await response.json();
  return payload.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || FALLBACK_MESSAGE;
};

exports.getHistory = async (req, res) => {
  try {
    const messages = await ChatbotMessage.find({ user: req.user.id }).sort({ createdAt: 1 }).limit(100);
    res.status(200).json({ success: true, messages });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Unable to fetch assistant history' });
  }
};

exports.sendMessage = async (req, res) => {
  try {
    const message = req.body.message.trim();
    const history = await ChatbotMessage.find({ user: req.user.id }).sort({ createdAt: -1 }).limit(12);
    history.reverse();
    const context = await getUserContext(req.user.id);
    const userMessage = await ChatbotMessage.create({ user: req.user.id, role: 'user', text: message });

    let reply;
    try {
      reply = await callGemini(message, context, history);
    } catch (error) {
      reply = FALLBACK_MESSAGE;
    }

    const assistantMessage = await ChatbotMessage.create({ user: req.user.id, role: 'model', text: reply });
    res.status(200).json({ success: true, messages: [userMessage, assistantMessage] });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Unable to contact the HR assistant' });
  }
};

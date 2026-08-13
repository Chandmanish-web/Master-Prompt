const User = require('../models/User');
const Attendance = require('../models/Attendance');
const Task = require('../models/Task');
const Leave = require('../models/Leave');
const Chat = require('../models/Chat');

const createIndexes = async () => {
  try {
    console.log('Creating database indexes...');

    // User indexes
    await User.collection.createIndex({ email: 1 }, { unique: true });
    await User.collection.createIndex({ managerId: 1 });
    await User.collection.createIndex({ role: 1 });

    // Attendance indexes
    await Attendance.collection.createIndex({ userId: 1, date: 1 }, { unique: true });
    await Attendance.collection.createIndex({ userId: 1 });
    await Attendance.collection.createIndex({ date: 1 });

    // Task indexes
    await Task.collection.createIndex({ assignedTo: 1, status: 1 });
    await Task.collection.createIndex({ assignedBy: 1 });
    await Task.collection.createIndex({ status: 1 });
    await Task.collection.createIndex({ deadline: 1 });

    // Leave indexes
    await Leave.collection.createIndex({ userId: 1, status: 1 });
    await Leave.collection.createIndex({ startDate: 1, endDate: 1 });
    await Leave.collection.createIndex({ approverId: 1 });

    // Chat indexes
    await Chat.collection.createIndex({ conversationId: 1, createdAt: -1 });
    await Chat.collection.createIndex({ senderId: 1 });
    await Chat.collection.createIndex({ createdAt: 1 });

    console.log('✓ Database indexes created successfully');
  } catch (error) {
    console.error('Error creating indexes:', error.message);
  }
};

module.exports = createIndexes;

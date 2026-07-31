const cron = require('node-cron');
const Attendance = require('../models/Attendance');
const User = require('../models/User');

const markAbsent = async () => {
  try {
    const start = new Date();
    start.setHours(0, 0, 0, 0);

    const end = new Date();
    end.setHours(23, 59, 59, 999);

    const users = await User.find({});
    const existingRecords = await Attendance.find({ date: { $gte: start, $lte: end } });
    const existingUserIds = new Set(existingRecords.map((record) => record.userId.toString()));

    const recordsToCreate = users
      .filter((user) => !existingUserIds.has(user._id.toString()))
      .map((user) => ({
        userId: user._id,
        date: new Date(),
        status: 'Absent',
      }));

    if (recordsToCreate.length) {
      await Attendance.insertMany(recordsToCreate);
      console.log(`Marked ${recordsToCreate.length} users absent`);
    }
  } catch (error) {
    console.error('Absent marking job failed:', error.message);
  }
};

const startAbsentJob = () => {
  cron.schedule('0 11 * * *', () => {
    markAbsent();
  });
};

module.exports = { startAbsentJob, markAbsent };

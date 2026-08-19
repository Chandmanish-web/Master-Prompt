const Attendance = require('../models/Attendance');
const User = require('../models/User');

const getTodayStart = () => {
  const now = new Date();
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);
  return start;
};

const getTodayEnd = () => {
  const now = new Date();
  const end = new Date(now);
  end.setHours(23, 59, 59, 999);
  return end;
};

const isLate = (checkInTime) => {
  const cutoff = new Date(checkInTime);
  cutoff.setHours(9, 30, 0, 0);
  return checkInTime > cutoff;
};

exports.checkIn = async (req, res) => {
  try {
    const todayStart = getTodayStart();
    const todayEnd = getTodayEnd();

    let attendance = await Attendance.findOne({
      userId: req.user.id,
      date: { $gte: todayStart, $lte: todayEnd },
    });

    if (!attendance) {
      attendance = new Attendance({
        userId: req.user.id,
        date: new Date(),
        status: 'Present',
      });
    }

    if (attendance.checkIn) {
      return res.status(400).json({ success: false, message: 'You have already checked in today' });
    }

    const checkInTime = new Date();
    attendance.checkIn = checkInTime;
    attendance.status = isLate(checkInTime) ? 'Late' : 'Present';
    await attendance.save();

    res.status(200).json({ success: true, attendance });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Unable to check in' });
  }
};

exports.checkOut = async (req, res) => {
  try {
    const todayStart = getTodayStart();
    const todayEnd = getTodayEnd();

    const attendance = await Attendance.findOne({
      userId: req.user.id,
      date: { $gte: todayStart, $lte: todayEnd },
    });

    if (!attendance) {
      return res.status(404).json({ success: false, message: 'No attendance record found for today' });
    }

    if (!attendance.checkIn) {
      return res.status(400).json({ success: false, message: 'You need to check in before checking out' });
    }

    if (attendance.checkOut) {
      return res.status(400).json({ success: false, message: 'You have already checked out today' });
    }

    attendance.checkOut = new Date();
    if (attendance.status !== 'Late') {
      attendance.status = 'Present';
    }
    await attendance.save();

    res.status(200).json({ success: true, attendance });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Unable to check out' });
  }
};

exports.getToday = async (req, res) => {
  try {
    const todayStart = getTodayStart();
    const todayEnd = getTodayEnd();

    const attendance = await Attendance.findOne({
      userId: req.user.id,
      date: { $gte: todayStart, $lte: todayEnd },
    });

    res.status(200).json({ success: true, attendance });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Unable to fetch today attendance' });
  }
};

exports.getReport = async (req, res) => {
  try {
    const { userId, month } = req.query;
    const query = {};

    if (userId) query.userId = userId;

    if (month) {
      const [year, m] = month.split('-').map(Number);
      const start = new Date(Date.UTC(year, m - 1, 1));
      const end = new Date(Date.UTC(year, m, 1));
      query.date = { $gte: start, $lt: end };
    }

    if (req.user.role === 'employee') {
      query.userId = req.user.id;
    }

    const records = await Attendance.find(query).populate('userId', 'name role email').sort({ date: 1 });

    res.status(200).json({ success: true, records });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Unable to fetch attendance report' });
  }
};

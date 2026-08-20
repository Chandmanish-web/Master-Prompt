const Attendance = require('../models/Attendance');
const Leave = require('../models/Leave');
const Task = require('../models/Task');
const Holiday = require('../models/Holiday');
const User = require('../models/User');

exports.getEvents = async (req, res) => {
  try {
    const start = new Date(req.query.start);
    const end = new Date(req.query.end);
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || start >= end) {
      return res.status(400).json({ success: false, message: 'Valid start and end dates are required' });
    }

    let userIds = [req.user.id];
    if (req.user.role !== 'employee') {
      const team = req.user.role === 'admin'
        ? await User.find({ role: { $in: ['manager', 'employee'] } }).select('_id')
        : await User.find({ managerId: req.user.id }).select('_id');
      userIds = [req.user.id, ...team.map((user) => user._id)];
    }

    const [attendance, leaves, tasks, holidays] = await Promise.all([
      Attendance.find({ userId: { $in: userIds }, date: { $gte: start, $lt: end } }).populate('userId', 'name'),
      Leave.find({ userId: { $in: userIds }, status: 'Approved', fromDate: { $lt: end }, toDate: { $gte: start } }).populate('userId', 'name'),
      Task.find({ assignedTo: { $in: userIds }, deadline: { $gte: start, $lt: end } }).populate('assignedTo', 'name'),
      Holiday.find({ date: { $gte: start, $lt: end } }),
    ]);

    const events = [
      ...attendance.map((item) => ({ id: `attendance-${item._id}`, title: `${item.status}${item.userId?.name ? ` - ${item.userId.name}` : ''}`, start: item.date, end: item.checkOut || new Date(new Date(item.date).getTime() + 3600000), type: item.status, data: item })),
      ...leaves.map((item) => ({ id: `leave-${item._id}`, title: `Leave${item.userId?.name ? ` - ${item.userId.name}` : ''}`, start: item.fromDate, end: item.toDate, type: 'Leave', data: item })),
      ...tasks.map((item) => ({ id: `task-${item._id}`, title: `Task due: ${item.title}`, start: item.deadline, end: item.deadline, type: 'Task Due', data: item })),
      ...holidays.map((item) => ({ id: `holiday-${item._id}`, title: item.name, start: item.date, end: item.date, type: 'Holiday', data: item })),
    ];

    res.status(200).json({ success: true, events });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Unable to fetch calendar events' });
  }
};

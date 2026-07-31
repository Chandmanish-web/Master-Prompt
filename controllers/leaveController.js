const Leave = require('../models/Leave');
const User = require('../models/User');

const calculateLeaveDays = (fromDate, toDate) => {
  const start = new Date(fromDate);
  const end = new Date(toDate);
  const timeDiff = end.setHours(0, 0, 0, 0) - start.setHours(0, 0, 0, 0);
  const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24)) + 1;
  return days > 0 ? days : 0;
};

exports.applyLeave = async (req, res) => {
  try {
    const { type, fromDate, toDate, reason } = req.body;

    if (!type || !fromDate || !toDate) {
      return res.status(400).json({ success: false, message: 'Type, fromDate, and toDate are required' });
    }

    const days = calculateLeaveDays(fromDate, toDate);
    if (days <= 0) {
      return res.status(400).json({ success: false, message: 'Invalid leave date range' });
    }

    const leave = await Leave.create({
      userId: req.user.id,
      type,
      fromDate,
      toDate,
      reason,
      days,
      status: 'Pending',
    });

    res.status(201).json({ success: true, leave });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Failed to apply for leave' });
  }
};

exports.getMyLeaves = async (req, res) => {
  try {
    const leaves = await Leave.find({ userId: req.user.id })
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, leaves });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Failed to fetch leaves' });
  }
};

exports.getPendingLeaves = async (req, res) => {
  try {
    const currentUser = await User.findById(req.user.id);

    if (!currentUser) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    let query = { status: 'Pending' };

    if (currentUser.role === 'manager') {
      query = {
        ...query,
        userId: { $ne: currentUser._id },
      };
    }

    const leaves = await Leave.find(query)
      .populate('userId', 'name email role managerId')
      .sort({ createdAt: -1 });

    const filteredLeaves = leaves.filter((leave) => {
      if (currentUser.role === 'admin') return true;
      return leave.userId.managerId?.toString() === currentUser._id.toString();
    });

    res.status(200).json({ success: true, leaves: filteredLeaves });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Failed to fetch pending leaves' });
  }
};

exports.updateLeaveStatus = async (req, res) => {
  try {
    const { leaveId } = req.params;
    const { status } = req.body;

    if (!['Approved', 'Rejected'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    const leave = await Leave.findById(leaveId);
    if (!leave) {
      return res.status(404).json({ success: false, message: 'Leave request not found' });
    }

    if (leave.status !== 'Pending') {
      return res.status(400).json({ success: false, message: 'Leave request already processed' });
    }

    const approver = await User.findById(req.user.id);
    if (!approver) {
      return res.status(404).json({ success: false, message: 'Approver not found' });
    }

    if (status === 'Approved') {
      const user = await User.findById(leave.userId);
      if (!user) {
        return res.status(404).json({ success: false, message: 'Leave owner not found' });
      }

      if (user.leaveBalance < leave.days) {
        return res.status(400).json({ success: false, message: 'Insufficient leave balance' });
      }

      user.leaveBalance -= leave.days;
      await user.save();
      leave.status = 'Approved';
      leave.approvedBy = approver._id;
      await leave.save();
    } else {
      leave.status = 'Rejected';
      leave.approvedBy = approver._id;
      await leave.save();
    }

    res.status(200).json({ success: true, leave });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Failed to update leave status' });
  }
};

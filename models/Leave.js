const mongoose = require('mongoose');

const leaveSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User is required'],
    },
    type: {
      type: String,
      enum: ['Sick', 'Casual', 'Paid'],
      required: [true, 'Leave type is required'],
    },
    fromDate: {
      type: Date,
      required: [true, 'Start date is required'],
    },
    toDate: {
      type: Date,
      required: [true, 'End date is required'],
    },
    reason: {
      type: String,
      trim: true,
      default: '',
    },
    days: {
      type: Number,
      required: true,
      min: [1, 'Leave duration must be at least 1 day'],
    },
    status: {
      type: String,
      enum: ['Pending', 'Approved', 'Rejected'],
      default: 'Pending',
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Leave', leaveSchema);

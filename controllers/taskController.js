const Task = require('../models/Task');
const User = require('../models/User');

const populateTask = (query) =>
  query
    .populate('assignedTo', 'name email role')
    .populate('assignedBy', 'name email role');

const canManageTask = (currentUser, targetUser) => {
  if (!targetUser) return false;
  if (currentUser.role === 'admin') return true;
  if (currentUser.role === 'manager') {
    return targetUser.managerId?.toString() === currentUser.id || targetUser._id.toString() === currentUser.id;
  }
  return false;
};

exports.createTask = async (req, res) => {
  try {
    if (!['manager', 'admin'].includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Only managers and admins can create tasks' });
    }

    const { title, description, assignedTo, deadline, priority } = req.body;

    if (!title || !assignedTo || !deadline) {
      return res.status(400).json({ success: false, message: 'Title, assignee, and deadline are required' });
    }

    const assignee = await User.findById(assignedTo);
    if (!assignee) {
      return res.status(404).json({ success: false, message: 'Assignee not found' });
    }

    if (!canManageTask(req.user, assignee)) {
      return res.status(403).json({ success: false, message: 'You can only assign tasks to your team members' });
    }

    const task = await Task.create({
      title,
      description: description || '',
      assignedTo,
      assignedBy: req.user.id,
      deadline,
      priority: priority || 'Medium',
      status: 'Assigned',
    });

    const populatedTask = await populateTask(Task.findById(task._id));
    res.status(201).json({ success: true, task: populatedTask });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Unable to create task' });
  }
};

exports.getMyTasks = async (req, res) => {
  try {
    const tasks = await populateTask(Task.find({ assignedTo: req.user.id }).sort({ deadline: 1 }));
    res.status(200).json({ success: true, tasks });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Unable to fetch your tasks' });
  }
};

exports.getTeamTasks = async (req, res) => {
  try {
    if (!['manager', 'admin'].includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Only managers and admins can view team tasks' });
    }

    const { status } = req.query;
    const query = { assignedBy: req.user.id };

    if (status) {
      query.status = status;
    }

    const tasks = await populateTask(Task.find(query).sort({ deadline: 1 }));
    res.status(200).json({ success: true, tasks });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Unable to fetch team tasks' });
  }
};

exports.updateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const task = await Task.findById(id);

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    if (task.assignedTo.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'You can only update your own tasks' });
    }

    if (task.status !== 'Assigned') {
      return res.status(400).json({ success: false, message: 'Task can only be started from Assigned' });
    }

    task.status = 'In Progress';
    await task.save();

    const populatedTask = await populateTask(Task.findById(task._id));
    res.status(200).json({ success: true, task: populatedTask });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Unable to update task status' });
  }
};

exports.submitTask = async (req, res) => {
  try {
    const { id } = req.params;
    const { text, fileUrl } = req.body;

    const task = await Task.findById(id);
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    if (task.assignedTo.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'You can only submit your own tasks' });
    }

    if (task.status === 'Reviewed') {
      return res.status(400).json({ success: false, message: 'This task has already been reviewed' });
    }

    if (!text?.trim()) {
      return res.status(400).json({ success: false, message: 'Submission text is required' });
    }

    task.submission = {
      text,
      fileUrl: fileUrl || '',
      submittedAt: new Date(),
    };
    task.status = 'Submitted';
    await task.save();

    const populatedTask = await populateTask(Task.findById(task._id));
    res.status(200).json({ success: true, task: populatedTask });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Unable to submit task' });
  }
};

exports.reviewTask = async (req, res) => {
  try {
    if (!['manager', 'admin'].includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Only managers and admins can review tasks' });
    }

    const { id } = req.params;
    const { decision, rating, feedback } = req.body;

    const task = await Task.findById(id);
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    if (decision === 'approve') {
      if (!rating || Number(rating) < 1 || Number(rating) > 5) {
        return res.status(400).json({ success: false, message: 'A rating between 1 and 5 is required' });
      }
      task.status = 'Reviewed';
      task.review = {
        rating: Number(rating),
        feedback: feedback || '',
        reviewedAt: new Date(),
      };
    } else if (decision === 'rework') {
      if (!feedback?.trim()) {
        return res.status(400).json({ success: false, message: 'Feedback is required when sending a task back for rework' });
      }
      task.status = 'In Progress';
      task.review = {
        rating: null,
        feedback,
        reviewedAt: new Date(),
      };
    } else {
      return res.status(400).json({ success: false, message: 'Decision must be approve or rework' });
    }

    await task.save();
    const populatedTask = await populateTask(Task.findById(task._id));
    res.status(200).json({ success: true, task: populatedTask });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Unable to review task' });
  }
};

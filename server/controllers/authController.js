const jwt = require('jsonwebtoken');
const User = require('../models/User');

const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: '7d',
  });
};

exports.register = async (req, res) => {
  try {
    const { name, email, password, role, department, managerId, joinDate } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email, password, and role',
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with that email',
      });
    }

    const user = await User.create({
      name,
      email,
      password,
      role,
      department,
      managerId,
      joinDate,
    });

    const token = generateToken(user._id, user.role);

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        leaveBalance: user.leaveBalance,
        department: user.department,
        managerId: user.managerId,
        joinDate: user.joinDate,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Registration failed',
    });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password',
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    const token = generateToken(user._id, user.role);

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        leaveBalance: user.leaveBalance,
        department: user.department,
        managerId: user.managerId,
        joinDate: user.joinDate,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Login failed',
    });
  }
};

exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Unable to fetch user profile',
    });
  }
};

exports.getTeamMembers = async (req, res) => {
  try {
    const currentUser = await User.findById(req.user.id).select('role managerId');

    let members = [];

    if (currentUser.role === 'admin') {
      members = await User.find({ role: { $ne: 'admin' } }).select('-password').sort({ name: 1 });
    } else if (currentUser.role === 'manager') {
      members = await User.find({
        _id: { $ne: currentUser._id },
        managerId: currentUser._id,
      })
        .select('-password')
        .sort({ name: 1 });
    } else if (currentUser.role === 'employee') {
      members = await User.find({
        $or: [{ _id: currentUser.managerId }, { managerId: currentUser.managerId }],
      })
        .select('-password')
        .sort({ name: 1 });
    }

    res.status(200).json({ success: true, members });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Unable to fetch team members' });
  }
};

const Team = require('../models/Team');

exports.getTeams = async (req, res) => {
  try {
    const query = req.user.role === 'admin' ? {} : { $or: [{ manager: req.user.id }, { members: req.user.id }] };
    const teams = await Team.find(query)
      .populate('manager', 'name email role')
      .populate('members', 'name email role')
      .sort({ name: 1 });
    res.status(200).json({ success: true, teams });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Unable to fetch teams' });
  }
};

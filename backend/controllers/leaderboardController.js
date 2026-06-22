const Prediction = require('../models/Prediction');
const Settings = require('../models/Settings');

const getLeaderboard = async (req, res) => {
  try {
    const leaderboardPublished = await Settings.get('leaderboardPublished', false);
    const officialResult = await Settings.get('officialResult', null);

    if (!leaderboardPublished) {
      return res.json({
        success: true,
        published: false,
        message: 'Leaderboard will be published after the official result is confirmed.',
        announcementDate: await Settings.get('announcementDate', null),
      });
    }

    const top = await Prediction.find({ points: { $ne: null } })
      .sort({ rank: 1, createdAt: 1 })
      .limit(100)
      .select('predictionId name predictedWinner yourGoals opponentGoals points rank createdAt');

    res.json({
      success: true,
      published: true,
      officialResult,
      data: top,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = { getLeaderboard };

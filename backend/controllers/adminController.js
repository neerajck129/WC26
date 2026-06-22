const Prediction = require('../models/Prediction');
const Settings = require('../models/Settings');
const { calculateAndRankAll } = require('../services/scoring');
const { sendResultNotification } = require('../services/telegram');
const xlsx = require('xlsx');

// Dashboard stats
const getDashboardStats = async (req, res) => {
  try {
    const total = await Prediction.countDocuments();
    const totalDonors = await Prediction.countDocuments({ isBloodDonor: true });

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayCount = await Prediction.countDocuments({ createdAt: { $gte: today } });

    const teamCounts = await Prediction.aggregate([
      { $group: { _id: '$predictedWinner', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    const bloodGroupCounts = await Prediction.aggregate([
      { $match: { isBloodDonor: true } },
      { $group: { _id: '$bloodGroup', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    const dailyTrend = await Prediction.aggregate([
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
      { $limit: 30 },
    ]);

    const officialResult = await Settings.get('officialResult', null);
    const leaderboardPublished = await Settings.get('leaderboardPublished', false);
    const submissionsOpen = await Settings.get('submissionsOpen', true);
    const announcementDate = await Settings.get('announcementDate', null);
    const finalKickoff = await Settings.get('finalKickoff', '2026-07-19T20:00:00.000Z');

    res.json({
      success: true,
      data: {
        total,
        totalDonors,
        todayCount,
        teamCounts,
        mostPredicted: teamCounts[0] || null,
        bloodGroupCounts,
        dailyTrend,
        officialResult,
        leaderboardPublished,
        submissionsOpen,
        announcementDate,
        finalKickoff,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Get all predictions with pagination, search, sort
const getPredictions = async (req, res) => {
  try {
    const { page = 1, limit = 20, search = '', sort = 'createdAt', order = 'desc' } = req.query;

    const query = search
      ? {
          $or: [
            { name: { $regex: search, $options: 'i' } },
            { phone: { $regex: search, $options: 'i' } },
            { predictionId: { $regex: search, $options: 'i' } },
            { predictedWinner: { $regex: search, $options: 'i' } },
          ],
        }
      : {};

    const total = await Prediction.countDocuments(query);
    const predictions = await Prediction.find(query)
      .sort({ [sort]: order === 'asc' ? 1 : -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.json({
      success: true,
      data: predictions,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit),
        limit: parseInt(limit),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Delete a prediction
const deletePrediction = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Prediction.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ success: false, message: 'Prediction not found' });
    res.json({ success: true, message: 'Prediction deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Get blood donors
const getBloodDonors = async (req, res) => {
  try {
    const { bloodGroup, search } = req.query;
    const query = { isBloodDonor: true };
    if (bloodGroup) query.bloodGroup = bloodGroup;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
      ];
    }
    const donors = await Prediction.find(query).select('name phone bloodGroup predictionId createdAt');
    res.json({ success: true, data: donors });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Save official result
const saveOfficialResult = async (req, res) => {
  try {
    const { winner, winnerGoals, opponentGoals } = req.body;
    if (!winner || winnerGoals === undefined || opponentGoals === undefined) {
      return res.status(400).json({ success: false, message: 'Winner, winnerGoals, and opponentGoals are required' });
    }

    const result = { winner: winner.trim(), winnerGoals: parseInt(winnerGoals), opponentGoals: parseInt(opponentGoals) };
    await Settings.set('officialResult', result);

    sendResultNotification(result).catch(console.error);

    res.json({ success: true, message: 'Official result saved', data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Calculate points and generate leaderboard
const calculateResults = async (req, res) => {
  try {
    const officialResult = await Settings.get('officialResult', null);
    if (!officialResult) {
      return res.status(400).json({ success: false, message: 'Official result not set yet' });
    }

    const predictions = await Prediction.find({});
    const ranked = await calculateAndRankAll(predictions, officialResult);

    // Bulk update points and ranks
    const bulkOps = ranked.map((p) => ({
      updateOne: {
        filter: { _id: p._id },
        update: { $set: { points: p.points, rank: p.rank } },
      },
    }));

    await Prediction.bulkWrite(bulkOps);

    res.json({ success: true, message: `Points calculated for ${ranked.length} predictions` });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Publish/unpublish leaderboard
const toggleLeaderboard = async (req, res) => {
  try {
    const { published } = req.body;
    await Settings.set('leaderboardPublished', !!published);
    res.json({ success: true, message: published ? 'Leaderboard published' : 'Leaderboard unpublished' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Toggle submissions open/closed
const toggleSubmissions = async (req, res) => {
  try {
    const { open } = req.body;
    await Settings.set('submissionsOpen', !!open);
    res.json({ success: true, message: open ? 'Submissions opened' : 'Submissions closed' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Update settings (announcement date, kickoff time)
const updateSettings = async (req, res) => {
  try {
    const { announcementDate, finalKickoff } = req.body;
    if (announcementDate) await Settings.set('announcementDate', announcementDate);
    if (finalKickoff) await Settings.set('finalKickoff', finalKickoff);
    res.json({ success: true, message: 'Settings updated' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Reset competition
const resetCompetition = async (req, res) => {
  try {
    await Prediction.deleteMany({});
    await Settings.set('officialResult', null);
    await Settings.set('leaderboardPublished', false);
    await Settings.set('submissionsOpen', true);
    res.json({ success: true, message: 'Competition reset successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Export predictions to Excel
const exportPredictions = async (req, res) => {
  try {
    const predictions = await Prediction.find({}).sort({ createdAt: -1 });
    const data = predictions.map((p) => ({
      'Prediction ID': p.predictionId,
      Name: p.name,
      Phone: p.phone,
      'Predicted Winner': p.predictedWinner,
      'Your Goals': p.yourGoals,
      'Opponent Goals': p.opponentGoals,
      'Blood Donor': p.isBloodDonor ? 'Yes' : 'No',
      'Blood Group': p.bloodGroup || '',
      Points: p.points ?? '',
      Rank: p.rank ?? '',
      'Submitted At': new Date(p.createdAt).toLocaleString('en-IN'),
    }));

    const ws = xlsx.utils.json_to_sheet(data);
    const wb = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(wb, ws, 'Predictions');

    const buf = xlsx.write(wb, { type: 'buffer', bookType: 'xlsx' });
    res.setHeader('Content-Disposition', 'attachment; filename="predictions.xlsx"');
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.send(buf);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Export blood donors to Excel
const exportDonors = async (req, res) => {
  try {
    const donors = await Prediction.find({ isBloodDonor: true }).sort({ bloodGroup: 1 });
    const data = donors.map((p) => ({
      'Prediction ID': p.predictionId,
      Name: p.name,
      Phone: p.phone,
      'Blood Group': p.bloodGroup || '',
      'Submitted At': new Date(p.createdAt).toLocaleString('en-IN'),
    }));

    const ws = xlsx.utils.json_to_sheet(data);
    const wb = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(wb, ws, 'Blood Donors');

    const buf = xlsx.write(wb, { type: 'buffer', bookType: 'xlsx' });
    res.setHeader('Content-Disposition', 'attachment; filename="blood-donors.xlsx"');
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.send(buf);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Export leaderboard to Excel
const exportLeaderboard = async (req, res) => {
  try {
    const predictions = await Prediction.find({ points: { $ne: null } }).sort({ rank: 1, createdAt: 1 });
    const data = predictions.map((p) => ({
      Rank: p.rank,
      'Prediction ID': p.predictionId,
      Name: p.name,
      'Predicted Winner': p.predictedWinner,
      'Prediction (W-O)': `${p.yourGoals} - ${p.opponentGoals}`,
      Points: p.points,
    }));

    const ws = xlsx.utils.json_to_sheet(data);
    const wb = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(wb, ws, 'Leaderboard');

    const buf = xlsx.write(wb, { type: 'buffer', bookType: 'xlsx' });
    res.setHeader('Content-Disposition', 'attachment; filename="leaderboard.xlsx"');
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.send(buf);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = {
  getDashboardStats,
  getPredictions,
  deletePrediction,
  getBloodDonors,
  saveOfficialResult,
  calculateResults,
  toggleLeaderboard,
  toggleSubmissions,
  updateSettings,
  resetCompetition,
  exportPredictions,
  exportDonors,
  exportLeaderboard,
};

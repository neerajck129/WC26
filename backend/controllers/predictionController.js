const Prediction = require('../models/Prediction');
const Settings = require('../models/Settings');
const { sendPredictionNotification } = require('../services/telegram');

// Submit a new prediction
const submitPrediction = async (req, res) => {
  try {
    // Check if submissions are open
    const submissionsOpen = await Settings.get('submissionsOpen', true);
    if (!submissionsOpen) {
      return res.status(403).json({
        success: false,
        message: 'Prediction submissions are closed. The final match has started.',
      });
    }

    const { name, phone, predictedWinner, yourGoals, opponentGoals, isBloodDonor, bloodGroup } = req.body;

    // Validate
    if (!name || name.trim().length < 3) {
      return res.status(400).json({ success: false, message: 'Name must be at least 3 characters' });
    }
    if (!phone || !/^\+?[\d\s\-]{7,15}$/.test(phone.trim())) {
      return res.status(400).json({ success: false, message: 'Invalid phone number format' });
    }
    if (!predictedWinner || !predictedWinner.trim()) {
      return res.status(400).json({ success: false, message: 'Predicted winner is required' });
    }
    if (yourGoals === undefined || yourGoals === null || yourGoals === '') {
      return res.status(400).json({ success: false, message: 'Your team goals is required' });
    }
    if (opponentGoals === undefined || opponentGoals === null || opponentGoals === '') {
      return res.status(400).json({ success: false, message: 'Opponent goals is required' });
    }
    if (isBloodDonor && !bloodGroup) {
      return res.status(400).json({ success: false, message: 'Blood group is required if you are a donor' });
    }

    // Check duplicate phone
    const existing = await Prediction.findOne({ phone: phone.trim() });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: 'You have already submitted a prediction.',
        predictionId: existing.predictionId,
      });
    }

    // Generate unique ID
    const predictionId = await Prediction.generatePredictionId();

    const prediction = await Prediction.create({
      predictionId,
      name: name.trim(),
      phone: phone.trim(),
      predictedWinner: predictedWinner.trim(),
      yourGoals: parseInt(yourGoals),
      opponentGoals: parseInt(opponentGoals),
      isBloodDonor: !!isBloodDonor,
      bloodGroup: isBloodDonor ? bloodGroup : null,
    });

    // Send Telegram notification (non-blocking)
    sendPredictionNotification(prediction).catch(console.error);

    res.status(201).json({
      success: true,
      message: 'Prediction submitted successfully!',
      data: {
        predictionId: prediction.predictionId,
        name: prediction.name,
        predictedWinner: prediction.predictedWinner,
        yourGoals: prediction.yourGoals,
        opponentGoals: prediction.opponentGoals,
        isBloodDonor: prediction.isBloodDonor,
        bloodGroup: prediction.bloodGroup,
        createdAt: prediction.createdAt,
      },
    });
  } catch (error) {
    console.error('Submit prediction error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Check if phone already submitted
const checkDuplicate = async (req, res) => {
  try {
    const { phone } = req.params;
    const existing = await Prediction.findOne({ phone: phone.trim() });
    res.json({
      success: true,
      exists: !!existing,
      predictionId: existing ? existing.predictionId : null,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Get public stats
const getPublicStats = async (req, res) => {
  try {
    const total = await Prediction.countDocuments();
    const teamCounts = await Prediction.aggregate([
      { $group: { _id: '$predictedWinner', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]);

    const submissionsOpen = await Settings.get('submissionsOpen', true);
    const announcementDate = await Settings.get('announcementDate', null);
    const finalKickoff = await Settings.get('finalKickoff', '2026-07-19T20:00:00.000Z');

    res.json({
      success: true,
      data: {
        total,
        teamCounts,
        submissionsOpen,
        announcementDate,
        finalKickoff,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = { submitPrediction, checkDuplicate, getPublicStats };

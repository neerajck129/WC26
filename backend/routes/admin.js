const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
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
} = require('../controllers/adminController');

router.use(protect);

router.get('/stats', getDashboardStats);
router.get('/predictions', getPredictions);
router.delete('/predictions/:id', deletePrediction);
router.get('/donors', getBloodDonors);
router.post('/result', saveOfficialResult);
router.post('/calculate', calculateResults);
router.post('/leaderboard/toggle', toggleLeaderboard);
router.post('/submissions/toggle', toggleSubmissions);
router.post('/settings', updateSettings);
router.post('/reset', resetCompetition);
router.get('/export/predictions', exportPredictions);
router.get('/export/donors', exportDonors);
router.get('/export/leaderboard', exportLeaderboard);

module.exports = router;

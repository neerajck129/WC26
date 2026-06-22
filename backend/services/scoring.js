/**
 * Scoring System:
 * Correct Winner:        +5 points
 * Correct Winner Goals:  +5 points
 * Correct Opponent Goals:+5 points
 * Maximum:               15 points
 */
const calculatePoints = (prediction, officialResult) => {
  let points = 0;

  const winnerMatch = prediction.predictedWinner.trim().toLowerCase() ===
    officialResult.winner.trim().toLowerCase();

  if (winnerMatch) {
    points += 5;
    if (prediction.yourGoals === officialResult.winnerGoals) points += 5;
    if (prediction.opponentGoals === officialResult.opponentGoals) points += 5;
  }

  return points;
};

const calculateAndRankAll = async (predictions, officialResult) => {
  // Calculate points for each prediction
  const withPoints = predictions.map((pred) => ({
    ...pred.toObject ? pred.toObject() : pred,
    points: calculatePoints(pred, officialResult),
  }));

  // Sort: by points DESC, then by createdAt ASC (earliest wins tiebreak)
  withPoints.sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    return new Date(a.createdAt) - new Date(b.createdAt);
  });

  // Assign ranks
  let currentRank = 1;
  for (let i = 0; i < withPoints.length; i++) {
    if (i > 0 && withPoints[i].points === withPoints[i - 1].points) {
      withPoints[i].rank = withPoints[i - 1].rank; // joint winners same rank
    } else {
      withPoints[i].rank = currentRank;
    }
    currentRank++;
  }

  return withPoints;
};

module.exports = { calculatePoints, calculateAndRankAll };

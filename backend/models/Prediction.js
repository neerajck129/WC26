const mongoose = require('mongoose');

const predictionSchema = new mongoose.Schema({
  predictionId: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    minlength: [3, 'Name must be at least 3 characters'],
    maxlength: [100, 'Name too long'],
  },
  phone: {
    type: String,
    required: [true, 'Phone is required'],
    unique: true,
    trim: true,
  },
  predictedWinner: {
    type: String,
    required: [true, 'Predicted winner is required'],
    trim: true,
  },
  yourGoals: {
    type: Number,
    required: [true, 'Your team goals is required'],
    min: [0, 'Goals cannot be negative'],
    max: [20, 'That seems too many goals'],
  },
  opponentGoals: {
    type: Number,
    required: [true, 'Opponent goals is required'],
    min: [0, 'Goals cannot be negative'],
    max: [20, 'That seems too many goals'],
  },
  isBloodDonor: {
    type: Boolean,
    default: false,
  },
  bloodGroup: {
    type: String,
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', null],
    default: null,
  },
  points: {
    type: Number,
    default: null,
  },
  rank: {
    type: Number,
    default: null,
  },
}, {
  timestamps: true,
});

// Generate unique prediction ID
predictionSchema.statics.generatePredictionId = async function () {
  let id;
  let exists = true;
  while (exists) {
    const num = Math.floor(10000 + Math.random() * 90000);
    id = `WC26-${num}`;
    exists = await this.findOne({ predictionId: id });
  }
  return id;
};

module.exports = mongoose.model('Prediction', predictionSchema);

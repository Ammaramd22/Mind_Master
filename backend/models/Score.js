//backend/models/Score.js
const mongoose = require('mongoose');

const ScoreSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  score: { type: Number, required: true },
});

module.exports = mongoose.model('Score', ScoreSchema);

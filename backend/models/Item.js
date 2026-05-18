const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
  name:      { type: String, required: true },
  category:  { type: String, enum: ['Work', 'Personal', 'Shopping', 'Health'], default: 'Personal' },
  dueDate:   { type: Date },
  completed: { type: Boolean, default: false },
  user:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  order:     { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Item', itemSchema);
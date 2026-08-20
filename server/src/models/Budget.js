const mongoose = require('mongoose');

const CATEGORIES = ['Salary', 'Food', 'Travel', 'Shopping', 'Bills', 'Entertainment', 'Other'];

const budgetSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    monthlyLimit: { type: Number, default: null },
    categoryBudgets: [
      {
        _id: false,
        category: { type: String, enum: CATEGORIES, required: true },
        limit: { type: Number, required: true, min: 0 },
      },
    ],
    clientUpdatedAt: { type: String, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Budget', budgetSchema);

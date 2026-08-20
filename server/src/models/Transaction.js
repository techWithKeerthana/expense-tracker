const mongoose = require('mongoose');

const CATEGORIES = ['Salary', 'Food', 'Travel', 'Shopping', 'Bills', 'Entertainment', 'Other'];

const transactionSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    // clientId matches the id generated locally on-device (src/utils/id.ts) so sync can match records.
    clientId: { type: String, required: true },
    title: { type: String, required: true, trim: true, maxlength: 120 },
    amount: { type: Number, required: true, min: 0.01 },
    type: { type: String, required: true, enum: ['income', 'expense'] },
    category: { type: String, required: true, enum: CATEGORIES },
    date: { type: String, required: true },
    notes: { type: String, maxlength: 500 },
    // Receipt photos are local device file URIs and are not portable to the backend; not synced.
    clientUpdatedAt: { type: String, required: true },
    deleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

transactionSchema.index({ userId: 1, clientId: 1 }, { unique: true });

module.exports = mongoose.model('Transaction', transactionSchema);

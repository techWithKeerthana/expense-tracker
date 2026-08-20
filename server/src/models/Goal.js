const mongoose = require('mongoose');

const goalSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    clientId: { type: String, required: true },
    name: { type: String, required: true, trim: true, maxlength: 80 },
    icon: { type: String, default: 'flag-outline' },
    targetAmount: { type: Number, required: true, min: 1 },
    targetDate: { type: String, required: true },
    savedAmount: { type: Number, default: 0, min: 0 },
    clientUpdatedAt: { type: String, required: true },
    deleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

goalSchema.index({ userId: 1, clientId: 1 }, { unique: true });

module.exports = mongoose.model('Goal', goalSchema);

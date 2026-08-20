const Budget = require('../models/Budget');

async function get(req, res, next) {
  try {
    const budget = await Budget.findOne({ userId: req.user.id }).lean();
    res.json({ budget: budget ?? null });
  } catch (err) {
    next(err);
  }
}

async function sync(req, res, next) {
  try {
    const { monthlyLimit, categoryBudgets, clientUpdatedAt } = req.body;
    if (!clientUpdatedAt) {
      return res.status(400).json({ message: 'clientUpdatedAt is required' });
    }

    const existing = await Budget.findOne({ userId: req.user.id });
    if (!existing || new Date(clientUpdatedAt) > new Date(existing.clientUpdatedAt)) {
      const updated = await Budget.findOneAndUpdate(
        { userId: req.user.id },
        { userId: req.user.id, monthlyLimit, categoryBudgets: categoryBudgets ?? [], clientUpdatedAt },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
      return res.json({ budget: updated });
    }

    res.json({ budget: existing });
  } catch (err) {
    next(err);
  }
}

module.exports = { get, sync };

const Goal = require('../models/Goal');

async function list(req, res, next) {
  try {
    const goals = await Goal.find({ userId: req.user.id, deleted: { $ne: true } }).lean();
    res.json({ goals });
  } catch (err) {
    next(err);
  }
}

async function sync(req, res, next) {
  try {
    const { goals } = req.body;
    if (!Array.isArray(goals)) {
      return res.status(400).json({ message: 'goals must be an array' });
    }

    for (const incoming of goals) {
      const { clientId, clientUpdatedAt } = incoming;
      if (!clientId || !clientUpdatedAt) continue;

      const existing = await Goal.findOne({ userId: req.user.id, clientId });
      if (!existing || new Date(clientUpdatedAt) > new Date(existing.clientUpdatedAt)) {
        await Goal.findOneAndUpdate(
          { userId: req.user.id, clientId },
          {
            userId: req.user.id,
            clientId,
            name: incoming.name,
            icon: incoming.icon,
            targetAmount: incoming.targetAmount,
            targetDate: incoming.targetDate,
            savedAmount: incoming.savedAmount,
            clientUpdatedAt,
            deleted: Boolean(incoming.deleted),
          },
          { upsert: true, new: true, setDefaultsOnInsert: true }
        );
      }
    }

    const goalsList = await Goal.find({ userId: req.user.id }).lean();
    res.json({ goals: goalsList });
  } catch (err) {
    next(err);
  }
}

module.exports = { list, sync };

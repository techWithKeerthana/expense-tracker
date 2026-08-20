const Transaction = require('../models/Transaction');

async function list(req, res, next) {
  try {
    const transactions = await Transaction.find({ userId: req.user.id, deleted: { $ne: true } }).lean();
    res.json({ transactions });
  } catch (err) {
    next(err);
  }
}

// Upserts each incoming transaction using last-write-wins (by clientUpdatedAt),
// then returns the user's full authoritative list so the client can replace its local cache.
async function sync(req, res, next) {
  try {
    const { transactions } = req.body;
    if (!Array.isArray(transactions)) {
      return res.status(400).json({ message: 'transactions must be an array' });
    }

    for (const incoming of transactions) {
      const { clientId, clientUpdatedAt } = incoming;
      if (!clientId || !clientUpdatedAt) continue;

      const existing = await Transaction.findOne({ userId: req.user.id, clientId });
      if (!existing || new Date(clientUpdatedAt) > new Date(existing.clientUpdatedAt)) {
        await Transaction.findOneAndUpdate(
          { userId: req.user.id, clientId },
          {
            userId: req.user.id,
            clientId,
            title: incoming.title,
            amount: incoming.amount,
            type: incoming.type,
            category: incoming.category,
            date: incoming.date,
            notes: incoming.notes,
            clientUpdatedAt,
            deleted: Boolean(incoming.deleted),
          },
          { upsert: true, new: true, setDefaultsOnInsert: true }
        );
      }
    }

    const transactionsList = await Transaction.find({ userId: req.user.id }).lean();
    res.json({ transactions: transactionsList });
  } catch (err) {
    next(err);
  }
}

module.exports = { list, sync };

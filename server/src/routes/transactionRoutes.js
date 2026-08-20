const { Router } = require('express');
const { requireAuth } = require('../middleware/auth');
const { list, sync } = require('../controllers/transactionController');

const router = Router();

router.use(requireAuth);
router.get('/', list);
router.post('/sync', sync);

module.exports = router;

const { Router } = require('express');
const { requireAuth } = require('../middleware/auth');
const { get, sync } = require('../controllers/budgetController');

const router = Router();

router.use(requireAuth);
router.get('/', get);
router.post('/sync', sync);

module.exports = router;

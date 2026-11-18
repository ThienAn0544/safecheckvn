const router = require('express').Router();
router.use('/warnings', require('./warning.routes'));
router.use('/reports', require('./report.routes'));
router.use('/stats', require('./stats.routes'));
module.exports = router;

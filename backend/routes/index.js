
const router = require('express').Router();

router.use('/auth', require('./auth.routes'));
router.use('/warnings', require('./warning.routes'));
router.use('/reports', require('./report.routes'));
router.use('/stats', require('./stats.routes'));
router.use('/admin', require('./admin.routes'));
router.use('/news', require('./news.routes'));

module.exports = router;

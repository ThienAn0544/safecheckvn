const router = require('express').Router();
router.get('/', require('../controllers/stats.controller').summary);
module.exports = router;

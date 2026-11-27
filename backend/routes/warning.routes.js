const router = require('express').Router();
const controller = require('../controllers/warning.controller');

router.get('/categories', controller.categories);
router.get('/', controller.list);
router.get('/:id', controller.detail);

module.exports = router;

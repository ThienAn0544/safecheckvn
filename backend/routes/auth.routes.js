const router = require('express').Router();
const controller = require('../controllers/auth.controller');
const requireAuth = require('../middleware/require-auth');

router.post('/register', controller.register);
router.post('/login', controller.login);
router.post('/social', controller.socialLogin);
router.post('/forgot-password', controller.forgotPassword);
router.post('/reset-password', controller.resetPassword);

router.get('/me', requireAuth, controller.me);
router.put('/profile', requireAuth, controller.updateProfile);
router.put('/password', requireAuth, controller.changePassword);

router.get('/my-reports', requireAuth, controller.myReports);
router.get('/watchlist', requireAuth, controller.getWatchlist);
router.post('/watchlist', requireAuth, controller.addWatchlist);
router.delete('/watchlist/:id', requireAuth, controller.removeWatchlist);

module.exports = router;

const jwt = require('jsonwebtoken');
const pool = require('../config/database');

module.exports = async (req, res, next) => {
  const token = req.headers.authorization?.replace(/^Bearer\s+/i, '');
  if (!token) return res.status(401).json({ success: false, message: 'Bạn chưa đăng nhập.' });
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
  } catch (_error) {
    return res.status(401).json({ success: false, message: 'Phiên đăng nhập không hợp lệ hoặc đã hết hạn.' });
  }
  try {
    const [[account]] = await pool.execute('SELECT role, status FROM users WHERE id = ?', [req.user.id]);
    if (account?.status !== 'active') {
      return res.status(403).json({ success: false, message: 'Tài khoản không còn hoạt động.' });
    }
    req.accountRole = account.role;
    next();
  } catch (error) { next(error); }
};

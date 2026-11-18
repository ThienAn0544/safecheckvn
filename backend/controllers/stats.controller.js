const pool = require('../config/database');
exports.summary = async (_req, res, next) => {
  try {
    const [[reports], [warnings], [users]] = await Promise.all([
      pool.query('SELECT COUNT(*) AS total FROM reports'),
      pool.query("SELECT COUNT(*) AS total FROM warnings WHERE status = 'published'"),
      pool.query("SELECT COUNT(*) AS total FROM users WHERE status = 'active'")
    ]);
    res.json({ success: true, data: { reports: reports[0].total, warnings: warnings[0].total, users: users[0].total } });
  } catch (error) { next(error); }
};

const router = require('express').Router();
const pool = require('../config/database');
const requireAuth = require('../middleware/require-auth');

router.use(requireAuth, (req, res, next) => {
  if (req.user.role !== 'admin' || req.accountRole !== 'admin') {
    return res.status(403).json({ message: 'Yêu cầu tài khoản quản trị đang hoạt động.' });
  }
  next();
});

router.get('/', async (_req, res, next) => {
  try {
    const [reports] = await pool.query(`SELECT r.id, r.scam_type, r.suspect_value, r.description, r.status, d.reason
      FROM reports r LEFT JOIN report_decisions d ON d.report_id = r.id
      ORDER BY (r.status = 'pending') DESC, r.id DESC LIMIT 100`);
    const [users] = await pool.query('SELECT id, full_name, email, role, status FROM users ORDER BY id DESC LIMIT 100');
    const [[totals]] = await pool.query(`SELECT
      (SELECT COUNT(*) FROM reports WHERE status = 'pending') AS pending,
      (SELECT COUNT(*) FROM reports WHERE status = 'verified') AS verified,
      (SELECT COUNT(*) FROM reports WHERE status = 'rejected') AS rejected,
      (SELECT COUNT(*) FROM users WHERE status = 'locked') AS locked`);
    res.json({ data: { reports, users, totals } });
  } catch (error) { next(error); }
});

router.patch('/reports/:id', async (req, res, next) => {
  const { status, reason } = req.body;
  const note = typeof reason === 'string' ? reason.trim() : '';
  if (!/^\d+$/.test(req.params.id) || !['verified', 'rejected'].includes(status) || !note || note.length > 500) {
    return res.status(422).json({ message: 'Chọn kết quả và nhập lý do từ 1 đến 500 ký tự.' });
  }
  let connection;
  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();
    const [result] = await connection.execute("UPDATE reports SET status = ? WHERE id = ? AND status = 'pending'", [status, req.params.id]);
    if (!result.affectedRows) {
      await connection.rollback();
      return res.status(409).json({ message: 'Báo cáo không còn trong hàng đợi.' });
    }
    await connection.execute('INSERT INTO report_decisions (report_id, reviewer_id, reason) VALUES (?, ?, ?)', [req.params.id, req.user.id, note]);
    await connection.commit();
    res.json({ success: true });
  } catch (error) {
    if (connection) await connection.rollback();
    next(error);
  } finally {
    connection?.release();
  }
});

router.patch('/users/:id', async (req, res, next) => {
  const { status } = req.body;
  if (!/^\d+$/.test(req.params.id) || !['locked', 'active'].includes(status)) {
    return res.status(422).json({ message: 'Trạng thái tài khoản không hợp lệ.' });
  }
  try {
    const [result] = await pool.execute("UPDATE users SET status = ? WHERE id = ? AND role <> 'admin'", [status, req.params.id]);
    if (!result.affectedRows) return res.status(404).json({ message: 'Không tìm thấy tài khoản có thể quản lý.' });
    res.json({ success: true });
  } catch (error) { next(error); }
});

module.exports = router;

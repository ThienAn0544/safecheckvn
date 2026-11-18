const pool = require('../config/database');
exports.list = async (req, res, next) => {
  try {
    const keyword = `%${String(req.query.q || '').trim()}%`;
    const [rows] = await pool.query(
      `SELECT w.id, w.title, w.summary, w.risk_level, w.status, w.created_at, c.name AS category_name
       FROM warnings w LEFT JOIN categories c ON c.id = w.category_id
       WHERE w.status = 'published' AND (w.title LIKE ? OR w.summary LIKE ?)
       ORDER BY w.created_at DESC LIMIT 50`, [keyword, keyword]);
    res.json({ success: true, data: rows });
  } catch (error) { next(error); }
};
exports.detail = async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      `SELECT w.*, c.name AS category_name FROM warnings w LEFT JOIN categories c ON c.id = w.category_id
       WHERE w.id = ? AND w.status = 'published' LIMIT 1`, [req.params.id]);
    if (!rows[0]) return res.status(404).json({ success: false, message: 'Không tìm thấy cảnh báo' });
    res.json({ success: true, data: rows[0] });
  } catch (error) { next(error); }
};

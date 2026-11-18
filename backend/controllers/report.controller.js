const pool = require('../config/database');
exports.list = async (_req, res, next) => {
  try {
    const [rows] = await pool.query(`SELECT id, reporter_name, scam_type, suspect_value, description, status, created_at FROM reports ORDER BY created_at DESC LIMIT 100`);
    res.json({ success: true, data: rows });
  } catch (error) { next(error); }
};
exports.create = async (req, res, next) => {
  try {
    const { reporterName, email, scamType, suspectValue, description } = req.body;
    if (!scamType || !suspectValue || !description || description.trim().length < 20) {
      return res.status(422).json({ success: false, message: 'Vui lòng nhập đủ thông tin; mô tả tối thiểu 20 ký tự.' });
    }
    const [result] = await pool.execute(
      `INSERT INTO reports (reporter_name, reporter_email, scam_type, suspect_value, description) VALUES (?, ?, ?, ?, ?)`,
      [reporterName || 'Ẩn danh', email || null, scamType, suspectValue, description.trim()]);
    res.status(201).json({ success: true, message: 'Đã tiếp nhận báo cáo', data: { id: result.insertId } });
  } catch (error) { next(error); }
};

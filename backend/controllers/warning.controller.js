const pool = require('../config/database');

const ALLOWED_RISK_LEVELS = new Set(['low', 'medium', 'high', 'critical']);
const ALLOWED_DAY_RANGES = new Set([7, 30, 90, 365]);
const DEFAULT_LIMIT = 9;
const MAX_LIMIT = 24;

function parsePositiveInteger(value, fallback) {
  const parsed = Number.parseInt(value, 10);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

exports.categories = async (_req, res, next) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, name, slug FROM categories ORDER BY name ASC'
    );

    res.json({ success: true, data: rows });
  } catch (error) {
    next(error);
  }
};

exports.list = async (req, res, next) => {
  try {
    const keyword = String(req.query.q || '').trim().slice(0, 120);
    const categoryValue = String(req.query.category_id || '').trim();
    const riskLevel = String(req.query.risk_level || '').trim().toLowerCase();
    const daysValue = String(req.query.days || '').trim();

    const categoryId = categoryValue ? Number(categoryValue) : null;
    if (categoryValue && (!/^\d+$/.test(categoryValue) || !Number.isSafeInteger(categoryId) || categoryId <= 0)) {
      return res.status(422).json({ success: false, message: 'Danh mục không hợp lệ.' });
    }

    if (riskLevel && !ALLOWED_RISK_LEVELS.has(riskLevel)) {
      return res.status(422).json({ success: false, message: 'Mức độ rủi ro không hợp lệ.' });
    }

    const days = daysValue ? Number.parseInt(daysValue, 10) : null;
    if (daysValue && (!Number.isInteger(days) || !ALLOWED_DAY_RANGES.has(days))) {
      return res.status(422).json({ success: false, message: 'Khoảng thời gian không hợp lệ.' });
    }

    const page = parsePositiveInteger(req.query.page, 1);
    const limit = Math.min(parsePositiveInteger(req.query.limit, DEFAULT_LIMIT), MAX_LIMIT);
    const offset = (page - 1) * limit;

    const conditions = ["w.status = 'published'"];
    const values = [];

    if (keyword) {
      const escapedKeyword = keyword.replace(/[\\%_]/g, '\\$&');
      const searchPattern = `%${escapedKeyword}%`;
      conditions.push('(w.title LIKE ? OR w.summary LIKE ? OR w.content LIKE ? OR c.name LIKE ?)');
      values.push(searchPattern, searchPattern, searchPattern, searchPattern);
    }

    if (categoryValue) {
      conditions.push('w.category_id = ?');
      values.push(categoryId);
    }

    if (riskLevel) {
      conditions.push('w.risk_level = ?');
      values.push(riskLevel);
    }

    if (days) {
      // days is restricted to a fixed allow-list above before being used in SQL.
      conditions.push(`w.created_at >= DATE_SUB(CURRENT_TIMESTAMP, INTERVAL ${days} DAY)`);
    }

    const whereClause = conditions.join(' AND ');
    const [countRows] = await pool.query(
      `SELECT COUNT(*) AS total
       FROM warnings w
       LEFT JOIN categories c ON c.id = w.category_id
       WHERE ${whereClause}`,
      values
    );
    const total = Number(countRows[0]?.total || 0);

    const [rows] = await pool.query(
      `SELECT w.id, w.title, w.summary, w.risk_level, w.created_at,
              c.name AS category_name, c.slug AS category_slug
       FROM warnings w
       LEFT JOIN categories c ON c.id = w.category_id
       WHERE ${whereClause}
       ORDER BY w.created_at DESC, w.id DESC
       LIMIT ? OFFSET ?`,
      [...values, limit, offset]
    );

    res.json({
      success: true,
      data: rows,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.detail = async (req, res, next) => {
  try {
    const warningId = Number(req.params.id);
    if (!Number.isSafeInteger(warningId) || warningId <= 0) {
      return res.status(400).json({ success: false, message: 'Mã cảnh báo không hợp lệ.' });
    }

    const [rows] = await pool.query(
      `SELECT w.id, w.title, w.summary, w.content, w.risk_level, w.created_at, w.updated_at,
              c.name AS category_name, c.slug AS category_slug
       FROM warnings w
       LEFT JOIN categories c ON c.id = w.category_id
       WHERE w.id = ? AND w.status = 'published'
       LIMIT 1`,
      [warningId]
    );

    if (!rows[0]) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy cảnh báo này.' });
    }

    res.json({ success: true, data: rows[0] });
  } catch (error) {
    next(error);
  }
};

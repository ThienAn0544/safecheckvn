const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/database');

const otpStore = new Map();

const publicUser = user => ({
  id: user.id,
  fullName: user.full_name,
  email: user.email,
  phone: user.phone || '',
  bio: user.bio || '',
  points: Number(user.points ?? 20),
  role: user.role
});

const createToken = user => jwt.sign(
  { id: user.id, email: user.email, role: user.role },
  process.env.JWT_SECRET || 'safecheck_dev_secret_key_2026',
  { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
);

exports.register = async (req, res, next) => {
  try {
    const fullName = String(req.body.fullName || '').trim();
    const email = String(req.body.email || '').trim().toLowerCase();
    const phone = String(req.body.phone || '').trim();
    const password = String(req.body.password || '');

    if (fullName.length < 2 || !/^\S+@\S+\.\S+$/.test(email) || password.length < 8) {
      return res.status(422).json({ success: false, message: 'Họ tên (≥2 ký tự), email hợp lệ hoặc mật khẩu (≥8 ký tự) chưa đúng.' });
    }

    const [existing] = await pool.execute('SELECT id FROM users WHERE email = ? LIMIT 1', [email]);
    if (existing[0]) {
      return res.status(409).json({ success: false, message: 'Email đã được sử dụng.' });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const [result] = await pool.execute(
      'INSERT INTO users (full_name, email, phone, points, password_hash) VALUES (?, ?, ?, 20, ?)',
      [fullName, email, phone || null, passwordHash]
    );

    const user = { id: result.insertId, full_name: fullName, email, phone, bio: '', points: 20, role: 'user' };
    res.status(201).json({
      success: true,
      message: 'Đăng ký thành công.',
      data: { token: createToken(user), user: publicUser(user) }
    });
  } catch (error) { next(error); }
};

exports.login = async (req, res, next) => {
  try {
    const identifier = String(req.body.email || req.body.identifier || '').trim().toLowerCase();
    const password = String(req.body.password || '');

    const [rows] = await pool.execute(
      'SELECT id, full_name, email, phone, bio, points, password_hash, role, status FROM users WHERE email = ? OR phone = ? LIMIT 1',
      [identifier, identifier]
    );
    const user = rows[0];
    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      return res.status(401).json({ success: false, message: 'Email/SĐT hoặc mật khẩu không đúng.' });
    }
    if (user.status !== 'active') {
      return res.status(403).json({ success: false, message: 'Tài khoản đã bị khóa bởi quản trị viên.' });
    }

    res.json({
      success: true,
      message: 'Đăng nhập thành công.',
      data: { token: createToken(user), user: publicUser(user) }
    });
  } catch (error) { next(error); }
};

exports.socialLogin = async (req, res, next) => {
  try {
    const provider = String(req.body.provider || 'Google').trim();
    const email = `${provider.toLowerCase()}.member@safecheck.vn`;
    const fullName = `Thành viên ${provider}`;

    const [rows] = await pool.execute('SELECT * FROM users WHERE email = ? LIMIT 1', [email]);
    let user = rows[0];
    if (user && (user.role !== 'user' || user.status !== 'active')) {
      return res.status(403).json({ success: false, message: 'Tài khoản này không dùng được đăng nhập mẫu.' });
    }
    if (!user) {
      const hash = await bcrypt.hash('SocialLogin@2026', 10);
      const [result] = await pool.execute(
        'INSERT INTO users (full_name, email, bio, points, password_hash) VALUES (?, ?, ?, 50, ?)',
        [fullName, email, `Tài khoản liên kết qua ${provider}`, hash]
      );
      user = { id: result.insertId, full_name: fullName, email, phone: '', bio: `Tài khoản liên kết qua ${provider}`, points: 50, role: 'user' };
    }
    res.json({
      success: true,
      message: `Đăng nhập qua ${provider} thành công.`,
      data: { token: createToken(user), user: publicUser(user) }
    });
  } catch (error) { next(error); }
};

exports.forgotPassword = async (req, res, next) => {
  try {
    const email = String(req.body.email || '').trim().toLowerCase();
    if (!email) return res.status(422).json({ success: false, message: 'Vui lòng nhập email đã đăng ký.' });

    const [rows] = await pool.execute("SELECT id FROM users WHERE email = ? AND role = 'user' AND status = 'active' LIMIT 1", [email]);
    if (!rows[0]) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy tài khoản với email này.' });
    }

    const otp = String(Math.floor(100000 + Math.random() * 900000));
    otpStore.set(email, { otp, expiresAt: Date.now() + 10 * 60 * 1000 });

    res.json({
      success: true,
      message: `Mã xác nhận OTP đã được tạo (Demo OTP: ${otp}).`,
      data: { demoOtp: otp }
    });
  } catch (error) { next(error); }
};

exports.resetPassword = async (req, res, next) => {
  try {
    const email = String(req.body.email || '').trim().toLowerCase();
    const otp = String(req.body.otp || '').trim();
    const newPassword = String(req.body.newPassword || '');

    if (newPassword.length < 8) {
      return res.status(422).json({ success: false, message: 'Mật khẩu mới phải có tối thiểu 8 ký tự.' });
    }

    const record = otpStore.get(email);
    if (!record || record.otp !== otp || Date.now() > record.expiresAt) {
      return res.status(400).json({ success: false, message: 'Mã OTP không đúng hoặc đã hết hạn.' });
    }

    const hash = await bcrypt.hash(newPassword, 12);
    const [result] = await pool.execute("UPDATE users SET password_hash = ? WHERE email = ? AND role = 'user' AND status = 'active'", [hash, email]);
    if (!result.affectedRows) return res.status(403).json({ success: false, message: 'Không thể đặt lại mật khẩu cho tài khoản này.' });
    otpStore.delete(email);

    res.json({ success: true, message: 'Đặt lại mật khẩu thành công. Bạn có thể đăng nhập ngay.' });
  } catch (error) { next(error); }
};

exports.me = async (req, res, next) => {
  try {
    const [rows] = await pool.execute(
      'SELECT id, full_name, email, phone, bio, points, role, status FROM users WHERE id = ? LIMIT 1',
      [req.user.id]
    );
    if (!rows[0]) return res.status(404).json({ success: false, message: 'Không tìm thấy tài khoản.' });
    res.json({ success: true, data: { user: publicUser(rows[0]) } });
  } catch (error) { next(error); }
};

exports.updateProfile = async (req, res, next) => {
  try {
    const fullName = String(req.body.fullName || '').trim();
    const phone = String(req.body.phone || '').trim();
    const bio = String(req.body.bio || '').trim();

    if (fullName.length < 2) {
      return res.status(422).json({ success: false, message: 'Họ tên phải có ít nhất 2 ký tự.' });
    }

    await pool.execute(
      'UPDATE users SET full_name = ?, phone = ?, bio = ? WHERE id = ?',
      [fullName, phone || null, bio || null, req.user.id]
    );

    const [rows] = await pool.execute(
      'SELECT id, full_name, email, phone, bio, points, role FROM users WHERE id = ? LIMIT 1',
      [req.user.id]
    );
    res.json({ success: true, message: 'Đã cập nhật thông tin hồ sơ.', data: { user: publicUser(rows[0]) } });
  } catch (error) { next(error); }
};

exports.changePassword = async (req, res, next) => {
  try {
    const currentPassword = String(req.body.currentPassword || '');
    const newPassword = String(req.body.newPassword || '');

    if (newPassword.length < 8) {
      return res.status(422).json({ success: false, message: 'Mật khẩu mới phải từ 8 ký tự trở lên.' });
    }

    const [rows] = await pool.execute('SELECT password_hash FROM users WHERE id = ? LIMIT 1', [req.user.id]);
    if (!rows[0] || !(await bcrypt.compare(currentPassword, rows[0].password_hash))) {
      return res.status(400).json({ success: false, message: 'Mật khẩu hiện tại không chính xác.' });
    }

    const hash = await bcrypt.hash(newPassword, 12);
    await pool.execute('UPDATE users SET password_hash = ? WHERE id = ?', [hash, req.user.id]);
    res.json({ success: true, message: 'Đổi mật khẩu thành công.' });
  } catch (error) { next(error); }
};

exports.myReports = async (req, res, next) => {
  try {
    const [rows] = await pool.execute(
      `SELECT id, scam_type, suspect_value, description, status, created_at
       FROM reports
       WHERE user_id = ? OR reporter_email = ?
       ORDER BY created_at DESC`,
      [req.user.id, req.user.email]
    );
    res.json({ success: true, data: rows });
  } catch (error) { next(error); }
};

exports.getWatchlist = async (req, res, next) => {
  try {
    const [rows] = await pool.execute(
      `SELECT w.id, w.suspect_value, w.note, w.risk_level, w.created_at,
              (SELECT COUNT(*) FROM reports r WHERE r.suspect_value = w.suspect_value) AS report_count
       FROM watchlist w
       WHERE w.user_id = ?
       ORDER BY w.created_at DESC`,
      [req.user.id]
    );
    res.json({ success: true, data: rows });
  } catch (error) { next(error); }
};

exports.addWatchlist = async (req, res, next) => {
  try {
    const suspectValue = String(req.body.suspectValue || '').trim();
    const note = String(req.body.note || '').trim();
    const riskLevel = ['low', 'medium', 'high'].includes(req.body.riskLevel) ? req.body.riskLevel : 'medium';

    if (!suspectValue) {
      return res.status(422).json({ success: false, message: 'Vui lòng nhập STK, SĐT hoặc đường dẫn cần theo dõi.' });
    }

    const [result] = await pool.execute(
      `INSERT INTO watchlist (user_id, suspect_value, note, risk_level)
       VALUES (?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE note = VALUES(note), risk_level = VALUES(risk_level)`,
      [req.user.id, suspectValue, note || null, riskLevel]
    );

    res.status(201).json({
      success: true,
      message: 'Đã thêm đối tượng vào danh sách theo dõi.',
      data: { id: result.insertId, suspect_value: suspectValue, note, risk_level: riskLevel, report_count: 1 }
    });
  } catch (error) { next(error); }
};

exports.removeWatchlist = async (req, res, next) => {
  try {
    await pool.execute('DELETE FROM watchlist WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
    res.json({ success: true, message: 'Đã bỏ theo dõi đối tượng.' });
  } catch (error) { next(error); }
};

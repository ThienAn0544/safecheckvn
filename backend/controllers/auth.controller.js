const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/database');

const publicUser = user => ({ id: user.id, fullName: user.full_name, email: user.email, role: user.role });
const createToken = user => jwt.sign(
  { id: user.id, email: user.email, role: user.role },
  process.env.JWT_SECRET,
  { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
);

exports.register = async (req, res, next) => {
  try {
    const fullName = String(req.body.fullName || '').trim();
    const email = String(req.body.email || '').trim().toLowerCase();
    const password = String(req.body.password || '');
    if (fullName.length < 2 || !/^\S+@\S+\.\S+$/.test(email) || password.length < 8) {
      return res.status(422).json({ success: false, message: 'Họ tên, email hoặc mật khẩu chưa hợp lệ.' });
    }
    const [existing] = await pool.execute('SELECT id FROM users WHERE email = ? LIMIT 1', [email]);
    if (existing[0]) return res.status(409).json({ success: false, message: 'Email đã được sử dụng.' });
    const passwordHash = await bcrypt.hash(password, 12);
    const [result] = await pool.execute(
      'INSERT INTO users (full_name, email, password_hash) VALUES (?, ?, ?)',
      [fullName, email, passwordHash]
    );
    const user = { id: result.insertId, full_name: fullName, email, role: 'user' };
    res.status(201).json({ success: true, message: 'Đăng ký thành công.', data: { token: createToken(user), user: publicUser(user) } });
  } catch (error) { next(error); }
};

exports.login = async (req, res, next) => {
  try {
    const email = String(req.body.email || '').trim().toLowerCase();
    const password = String(req.body.password || '');
    const [rows] = await pool.execute(
      'SELECT id, full_name, email, password_hash, role, status FROM users WHERE email = ? LIMIT 1',
      [email]
    );
    const user = rows[0];
    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      return res.status(401).json({ success: false, message: 'Email hoặc mật khẩu không đúng.' });
    }
    if (user.status !== 'active') return res.status(403).json({ success: false, message: 'Tài khoản đã bị khóa.' });
    res.json({ success: true, message: 'Đăng nhập thành công.', data: { token: createToken(user), user: publicUser(user) } });
  } catch (error) { next(error); }
};

exports.me = async (req, res, next) => {
  try {
    const [rows] = await pool.execute('SELECT id, full_name, email, role, status FROM users WHERE id = ? LIMIT 1', [req.user.id]);
    if (!rows[0]) return res.status(404).json({ success: false, message: 'Không tìm thấy tài khoản.' });
    res.json({ success: true, data: { user: publicUser(rows[0]) } });
  } catch (error) { next(error); }
};

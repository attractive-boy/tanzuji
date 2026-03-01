// 简化版认证系统 - 确保最小可用
const { pool } = require('./db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// JWT token 验证中间件
exports.requireApiToken = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: '需要提供有效的认证令牌' });
    }
    
    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, 'carbon-secret-key');
    req.userId = decoded.userId;
    req.username = decoded.username;
    next();
  } catch (error) {
    return res.status(401).json({ error: '无效的认证令牌' });
  }
};

// Token 验证函数
exports.verifyToken = (token) => {
  try {
    return jwt.verify(token, 'carbon-secret-key');
  } catch (error) {
    return null;
  }
};

// 用户注册
exports.register = async (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ error: '用户名和密码为必填项' });
    }
    
    // 检查用户名是否已存在
    const [existingUser] = await pool.query('SELECT id FROM users WHERE username = ?', [username]);
    if (existingUser.length > 0) {
      return res.status(409).json({ error: '用户名已存在' });
    }
    
    // 密码加密
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // 创建用户
    const [result] = await pool.query(
      'INSERT INTO users (username, password, created_at) VALUES (?, ?, NOW())',
      [username, hashedPassword]
    );
    
    // 生成JWT token
    const token = jwt.sign(
      { userId: result.insertId, username },
      'carbon-secret-key',
      { expiresIn: '7d' }
    );
    
    res.json({
      success: true,
      token,
      user: { id: result.insertId, username }
    });
  } catch (error) {
    console.error('注册错误:', error);
    res.status(500).json({ error: '注册失败' });
  }
};

// 用户登录
exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ error: '用户名和密码为必填项' });
    }
    
    // 查找用户
    const [users] = await pool.query('SELECT * FROM users WHERE username = ?', [username]);
    if (users.length === 0) {
      return res.status(401).json({ error: '用户名或密码错误' });
    }
    
    const user = users[0];
    
    // 验证密码
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: '用户名或密码错误' });
    }
    
    // 生成JWT token
    const token = jwt.sign(
      { userId: user.id, username: user.username },
      'carbon-secret-key',
      { expiresIn: '7d' }
    );
    
    res.json({
      success: true,
      token,
      user: { id: user.id, username: user.username }
    });
  } catch (error) {
    console.error('登录错误:', error);
    res.status(500).json({ error: '登录失败' });
  }
};
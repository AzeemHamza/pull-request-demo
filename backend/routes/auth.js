const express = require('express');
const { body, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const createError = require('http-errors');
const User = require('../models/User');
const auth = require('../middleware/auth');
const JWT_SECRET = process.env.JWT_SECRET || 'devsecret';

const router = express.Router();

// POST /api/auth/register
router.post('/register', [
  body('username').trim().notEmpty().withMessage('Username is required'),
  body('email').isEmail().withMessage('Invalid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
], async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(createError(400, errors.array()[0].msg));
  }
  try {
    const { username, email, password } = req.body;
    const user = new User({ username, email, password });
    await user.save();
    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '1d' });
    res.status(201).json({ token, user: { id: user._id, username, email } });
  } catch (err) {
    if (err.code === 11000) return next(createError(400, 'Username or email already exists'));
    next(err);
  }
});

// POST /api/auth/login
router.post('/login', [
  body('email').isEmail().withMessage('Invalid email'),
  body('password').notEmpty().withMessage('Password is required')
], async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return next(createError(400, errors.array()[0].msg));
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return next(createError(400, 'Invalid credentials'));
    const isMatch = await user.comparePassword(password);
    if (!isMatch) return next(createError(400, 'Invalid credentials'));
    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '1d' });
    res.json({ token, user: { id: user._id, username: user.username, email } });
  } catch (err) {
    next(err);
  }
});

// PUT /api/auth/profile – change username/email (protected)
router.put('/profile', auth, [
  body('username').optional().trim().notEmpty().withMessage('Username cannot be empty'),
  body('email').optional().isEmail().withMessage('Invalid email')
], async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return next(createError(400, errors.array()[0].msg));
  try {
    const updates = {};
    if (req.body.username) updates.username = req.body.username;
    if (req.body.email) updates.email = req.body.email;
    const user = await User.findByIdAndUpdate(req.userId, updates, { new: true, runValidators: true });
    res.json({ username: user.username, email: user.email });
  } catch (err) {
    if (err.code === 11000) return next(createError(400, 'Username or email already in use'));
    next(err);
  }
});

// PUT /api/auth/password – change password (protected)
router.put('/password', auth, [
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters')
], async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return next(createError(400, errors.array()[0].msg));
  try {
    const user = await User.findById(req.userId);
    const isMatch = await user.comparePassword(req.body.currentPassword);
    if (!isMatch) return next(createError(400, 'Current password is incorrect'));
    user.password = req.body.newPassword;
    await user.save();
    res.json({ message: 'Password updated' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
const express = require('express');
const router = express.Router();
const knex = require('../db');
const bcrypt = require('bcrypt');
const passport = require('passport');
const { body, validationResult } = require('express-validator');

// register
router.post('/register', [
  body('email').isEmail(),
  body('password').isLength({ min: 6 }),
  body('name').notEmpty()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  const { name, email, password } = req.body;
  try {
    const existing = await knex('users').where({ email }).first();
    if (existing) return res.status(409).json({ message: 'Email already registered' });
    const hash = await bcrypt.hash(password, 10);
    const [user] = await knex('users').insert({ name, email, password_hash: hash }).returning(['id', 'name', 'email']);
    req.login(user, (err) => {
      if (err) return res.status(500).json({ message: 'Login after register failed' });
      res.json({ user });
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// login
router.post('/login', (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    if (err) return next(err);
    if (!user) return res.status(401).json({ message: info?.message || 'Invalid credentials' });
    req.login(user, (err) => {
      if (err) return next(err);
      res.json({ user });
    });
  })(req, res, next);
});

// logout
router.post('/logout', (req, res) => {
  req.logout(() => {});
  req.session.destroy(() => res.json({ ok: true }));
});

// get current
router.get('/me', (req, res) => {
  if (!req.isAuthenticated()) return res.status(401).json({ user: null });
  res.json({ user: req.user });
});

module.exports = router;

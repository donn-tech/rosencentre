const express = require('express');
const router = express.Router();
const db = require('../db');

// Team member login (requires email + first name)
router.post('/login', (req, res) => {
  const { email, firstName } = req.body;

  if (!email || !email.trim()) {
    return res.status(400).json({ error: 'Please enter your email address.' });
  }

  if (!firstName || !firstName.trim()) {
    return res.status(400).json({ error: 'Please enter your first name.' });
  }

  const cleanEmail = email.trim().toLowerCase();
  const cleanFirstName = firstName.trim();

  const authCheck = db.isEmailAuthorized(cleanEmail);

  if (!authCheck.authorized) {
    return res.status(403).json({
      error: `Access denied: "${cleanEmail}" is not in the list of authorized emails. Please contact your team administrator to be added.`,
      unauthorizedEmail: cleanEmail
    });
  }

  return res.json({
    success: true,
    user: {
      email: cleanEmail,
      firstName: cleanFirstName,
      role: authCheck.role || 'member'
    }
  });
});

// Admin login
router.post('/admin-login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Please enter both email and password.' });
  }

  const check = db.verifyAdmin(email.trim(), password);
  if (!check.success) {
    return res.status(401).json({ error: 'Invalid admin credentials. Default is admin@company.com / admin' });
  }

  return res.json({
    success: true,
    user: check.user
  });
});

// Check if an email is authorized before submit (client helper)
router.get('/check-email', (req, res) => {
  const { email } = req.query;
  if (!email) {
    return res.status(400).json({ error: 'Email parameter required' });
  }
  const check = db.isEmailAuthorized(email);
  return res.json({ authorized: check.authorized, role: check.role || null });
});

module.exports = router;


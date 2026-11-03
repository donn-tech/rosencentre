const express = require('express');
const router = express.Router();
const db = require('../db');

// Get all authorized emails with quiz completion counts
router.get('/', (req, res) => {
  const emails = db.getAuthorizedEmails();
  const allSubmissions = db.getSubmissions();

  // Attach completion stats for each authorized member
  const enriched = emails.map((item) => {
    const userSubs = allSubmissions.filter(
      (s) => s.userEmail.toLowerCase() === item.email.toLowerCase()
    );
    const completedCount = userSubs.length;
    const passedCount = userSubs.filter((s) => s.passed).length;
    const lastActive = userSubs.length > 0 ? userSubs[0].submittedAt : null;
    const avgScore =
      userSubs.length > 0
        ? Math.round(userSubs.reduce((acc, s) => acc + s.percentage, 0) / userSubs.length)
        : null;

    return {
      ...item,
      completedCount,
      passedCount,
      lastActive,
      avgScore
    };
  });

  res.json(enriched);
});

// Add a single authorized email
router.post('/', (req, res) => {
  const { email, firstName, notes } = req.body;

  if (!email || !email.trim() || !email.includes('@')) {
    return res.status(400).json({ error: 'A valid email address is required.' });
  }

  try {
    const created = db.addAuthorizedEmail({ email, firstName, notes });
    res.status(201).json(created);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Batch add authorized emails (comma-separated or newline-separated or array)
router.post('/batch', (req, res) => {
  const { emails } = req.body;

  if (!emails) {
    return res.status(400).json({ error: 'Emails payload is required' });
  }

  let listToProcess = [];
  if (Array.isArray(emails)) {
    listToProcess = emails;
  } else if (typeof emails === 'string') {
    // split by newlines or commas
    listToProcess = emails
      .split(/[\n,;]+/)
      .map((e) => e.trim())
      .filter((e) => e.length > 0)
      .map((e) => ({ email: e }));
  }

  if (listToProcess.length === 0) {
    return res.status(400).json({ error: 'No valid emails found in request' });
  }

  const result = db.addBatchAuthorizedEmails(listToProcess);
  res.json(result);
});

// Update authorized email
router.put('/:id', (req, res) => {
  const { firstName, notes, email } = req.body;
  try {
    const updated = db.updateAuthorizedEmail(req.params.id, { firstName, notes, email });
    res.json(updated);
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
});

// Delete authorized email
router.delete('/:id', (req, res) => {
  try {
    db.deleteAuthorizedEmail(req.params.id);
    res.json({ success: true, message: 'Authorized email deleted successfully' });
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
});

module.exports = router;


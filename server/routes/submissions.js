const express = require('express');
const router = express.Router();
const db = require('../db');

// Submit a quiz attempt
router.post('/', (req, res) => {
  const { quizId, userEmail, firstName, answers, timeSpentSeconds } = req.body;

  if (!quizId) {
    return res.status(400).json({ error: 'Quiz ID is required' });
  }

  if (!userEmail || !userEmail.trim()) {
    return res.status(400).json({ error: 'User email is required' });
  }

  if (!firstName || !firstName.trim()) {
    return res.status(400).json({ error: 'First name is required' });
  }

  // Double check authorization
  const authCheck = db.isEmailAuthorized(userEmail);
  if (!authCheck.authorized) {
    return res.status(403).json({ error: 'User is not authorized to submit quizzes.' });
  }

  try {
    const submission = db.createSubmission({
      quizId,
      userEmail,
      firstName,
      answers: answers || {},
      timeSpentSeconds: timeSpentSeconds || 0
    });

    res.status(201).json(submission);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get submissions list
router.get('/', (req, res) => {
  const { quizId, userEmail } = req.query;
  const submissions = db.getSubmissions({ quizId, userEmail });
  res.json(submissions);
});

// Get single submission detail
router.get('/:id', (req, res) => {
  const submission = db.getSubmissionById(req.params.id);
  if (!submission) {
    return res.status(404).json({ error: 'Submission not found' });
  }

  // Enrich with quiz details if needed
  const quiz = db.getQuizById(submission.quizId);
  res.json({
    ...submission,
    quizDetails: quiz ? {
      title: quiz.title,
      description: quiz.description,
      questions: quiz.questions
    } : null
  });
});

module.exports = router;


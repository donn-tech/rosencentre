const express = require('express');
const router = express.Router();
const db = require('../db');

function stripAnswersFromQuiz(quiz) {
  return {
    ...quiz,
    questions: quiz.questions.map((q) => {
      const { correctAnswer, acceptedAnswers, explanation, ...safeQ } = q;
      return safeQ;
    })
  };
}

// Get all quizzes
router.get('/', (req, res) => {
  const { forTake, includeDrafts } = req.query;
  const isForTake = forTake === 'true';
  const onlyPublished = includeDrafts !== 'true';

  let quizzes = db.getQuizzes(onlyPublished);

  if (isForTake) {
    quizzes = quizzes.map(stripAnswersFromQuiz);
  }

  // Also include summary info (e.g. question count, total points)
  const enhanced = quizzes.map((q) => ({
    ...q,
    questionCount: q.questions ? q.questions.length : 0,
    totalPoints: q.questions ? q.questions.reduce((acc, curr) => acc + (Number(curr.points) || 10), 0) : 0
  }));

  res.json(enhanced);
});

// Get single quiz
router.get('/:id', (req, res) => {
  const { forTake } = req.query;
  const quiz = db.getQuizById(req.params.id);

  if (!quiz) {
    return res.status(404).json({ error: 'Quiz not found' });
  }

  if (forTake === 'true') {
    return res.json(stripAnswersFromQuiz(quiz));
  }

  res.json(quiz);
});

// Create quiz
router.post('/', (req, res) => {
  const { title, description, category, timeLimitMinutes, passingScorePercentage, status, questions } = req.body;

  if (!title || !title.trim()) {
    return res.status(400).json({ error: 'Quiz title is required' });
  }

  if (!questions || !Array.isArray(questions) || questions.length === 0) {
    return res.status(400).json({ error: 'Quiz must have at least one question' });
  }

  try {
    const created = db.createQuiz({
      title,
      description,
      category,
      timeLimitMinutes,
      passingScorePercentage,
      status,
      questions
    });
    res.status(201).json(created);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update quiz
router.put('/:id', (req, res) => {
  const { title, description, category, timeLimitMinutes, passingScorePercentage, status, questions } = req.body;

  if (!title || !title.trim()) {
    return res.status(400).json({ error: 'Quiz title is required' });
  }

  try {
    const updated = db.updateQuiz(req.params.id, {
      title,
      description,
      category,
      timeLimitMinutes,
      passingScorePercentage,
      status,
      questions
    });
    res.json(updated);
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
});

// Duplicate quiz
router.post('/:id/duplicate', (req, res) => {
  const quiz = db.getQuizById(req.params.id);
  if (!quiz) {
    return res.status(404).json({ error: 'Quiz not found' });
  }

  try {
    const duplicated = db.createQuiz({
      title: `${quiz.title} (Copy)`,
      description: quiz.description,
      category: quiz.category,
      timeLimitMinutes: quiz.timeLimitMinutes,
      passingScorePercentage: quiz.passingScorePercentage,
      status: 'draft',
      questions: quiz.questions
    });
    res.status(201).json(duplicated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete quiz
router.delete('/:id', (req, res) => {
  try {
    db.deleteQuiz(req.params.id);
    res.json({ success: true, message: 'Quiz deleted successfully' });
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
});

module.exports = router;


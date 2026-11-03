const express = require('express');
const router = express.Router();
const db = require('../db');

router.get('/', (req, res) => {
  const data = db.getData();
  const quizzes = data.quizzes || [];
  const submissions = data.submissions || [];
  const authorized = data.authorizedEmails || [];

  const totalQuizzes = quizzes.length;
  const publishedQuizzes = quizzes.filter((q) => q.status === 'published').length;
  const totalAuthorizedMembers = authorized.length;
  const totalSubmissions = submissions.length;

  const passedSubmissions = submissions.filter((s) => s.passed).length;
  const overallPassRate =
    totalSubmissions > 0 ? Math.round((passedSubmissions / totalSubmissions) * 100) : 0;

  const averageScore =
    totalSubmissions > 0
      ? Math.round(submissions.reduce((acc, s) => acc + s.percentage, 0) / totalSubmissions)
      : 0;

  // Recent 10 submissions
  const recentSubmissions = [...submissions]
    .sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt))
    .slice(0, 10);

  // Per quiz statistics
  const quizStats = quizzes.map((quiz) => {
    const quizSubs = submissions.filter((s) => s.quizId === quiz.id);
    const count = quizSubs.length;
    const passed = quizSubs.filter((s) => s.passed).length;
    const avg =
      count > 0 ? Math.round(quizSubs.reduce((acc, s) => acc + s.percentage, 0) / count) : 0;

    return {
      id: quiz.id,
      title: quiz.title,
      category: quiz.category,
      status: quiz.status,
      questionCount: quiz.questions.length,
      completionsCount: count,
      passCount: passed,
      passRate: count > 0 ? Math.round((passed / count) * 100) : 0,
      averageScore: avg
    };
  });

  // Unique active members
  const uniqueMemberEmails = new Set(submissions.map((s) => s.userEmail.toLowerCase()));
  const activeMembersCount = uniqueMemberEmails.size;

  res.json({
    totalQuizzes,
    publishedQuizzes,
    totalAuthorizedMembers,
    totalSubmissions,
    passedSubmissions,
    overallPassRate,
    averageScore,
    activeMembersCount,
    recentSubmissions,
    quizStats
  });
});

module.exports = router;


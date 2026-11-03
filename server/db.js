const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// In Vercel serverless environments, root filesystem is read-only, so use /tmp
const IS_VERCEL = !!process.env.VERCEL;
const LOCAL_DB_FILE = path.join(__dirname, 'data', 'db.json');
const DB_FILE = IS_VERCEL ? path.join('/tmp', 'db.json') : LOCAL_DB_FILE;

const INITIAL_DATA = {
  admin: {
    email: 'admin@company.com',
    password: 'admin',
    name: 'Team Admin'
  },
  authorizedEmails: [
    {
      id: 'auth-1',
      email: 'alex@company.com',
      firstName: 'Alex',
      role: 'member',
      notes: 'Customer Support',
      addedAt: new Date().toISOString()
    },
    {
      id: 'auth-2',
      email: 'sarah@company.com',
      firstName: 'Sarah',
      role: 'member',
      notes: 'Operations Team',
      addedAt: new Date().toISOString()
    },
    {
      id: 'auth-3',
      email: 'michael@company.com',
      firstName: 'Michael',
      role: 'member',
      notes: 'Front Desk',
      addedAt: new Date().toISOString()
    },
    {
      id: 'auth-4',
      email: 'team@company.com',
      firstName: 'Team Member',
      role: 'member',
      notes: 'General Staff',
      addedAt: new Date().toISOString()
    }
  ],
  quizzes: [
    {
      id: 'quiz-1',
      title: 'Company Core Values & Team Culture',
      description: 'Test your understanding of our mission, guest service expectations, and workplace standards.',
      category: 'Onboarding',
      timeLimitMinutes: 10,
      passingScorePercentage: 75,
      status: 'published',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      questions: [
        {
          id: 'q1',
          type: 'single_choice',
          prompt: 'What is our primary guiding principle when interacting with guests or teammates?',
          points: 10,
          explanation: 'Respect, empathy, and active listening form the foundation of our hospitality standard.',
          options: [
            { id: 'opt_1', text: 'Speed above all else, even if quality drops' },
            { id: 'opt_2', text: 'Deliver warmth, respect, and proactive assistance at every touchpoint' },
            { id: 'opt_3', text: 'Only assist when explicitly asked by management' },
            { id: 'opt_4', text: 'Minimize conversations to save time' }
          ],
          correctAnswer: 'opt_2'
        },
        {
          id: 'q2',
          type: 'multiple_choice',
          prompt: 'Which of the following actions reflect exceptional customer service? (Select all that apply)',
          points: 15,
          explanation: 'Greeting warmly, active listening, and following through all contribute directly to exceptional guest satisfaction.',
          options: [
            { id: 'opt_1', text: 'Smiling and greeting someone by name when known' },
            { id: 'opt_2', text: 'Actively listening without interrupting' },
            { id: 'opt_3', text: 'Escorting someone to their destination rather than just pointing' },
            { id: 'opt_4', text: 'Telling someone "That is not my department" and walking away' }
          ],
          correctAnswer: ['opt_1', 'opt_2', 'opt_3']
        },
        {
          id: 'q3',
          type: 'true_false',
          prompt: 'It is acceptable to share internal guest or client personal details in public areas if speaking quietly.',
          points: 10,
          explanation: 'Guest and client privacy is strictly confidential at all times and must never be discussed publicly.',
          options: [
            { id: 'true', text: 'True' },
            { id: 'false', text: 'False' }
          ],
          correctAnswer: 'false'
        },
        {
          id: 'q4',
          type: 'short_answer',
          prompt: 'Fill in the blank: Our commitment is to deliver service with ______ and excellence. (Hint: starts with "integrity")',
          points: 15,
          explanation: 'Integrity is a core pillar of our company philosophy.',
          acceptedAnswers: ['integrity', 'Integrity', 'INTEGRITY']
        }
      ]
    },
    {
      id: 'quiz-2',
      title: 'Workplace Safety & Emergency Preparedness',
      description: 'Critical knowledge for emergency situations, fire exits, and safety regulations.',
      category: 'Safety',
      timeLimitMinutes: 12,
      passingScorePercentage: 80,
      status: 'published',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      questions: [
        {
          id: 'q1',
          type: 'single_choice',
          prompt: 'In the event of a fire alarm, what should your first action be?',
          points: 10,
          explanation: 'Evacuate immediately via designated stairs and emergency exits without using elevators.',
          options: [
            { id: 'opt_1', text: 'Take the nearest elevator to the ground floor' },
            { id: 'opt_2', text: 'Evacuate calmly via marked emergency stairs to the assembly point' },
            { id: 'opt_3', text: 'Collect all personal belongings and laptops before moving' },
            { id: 'opt_4', text: 'Stay in your office until someone knocks on your door' }
          ],
          correctAnswer: 'opt_2'
        },
        {
          id: 'q2',
          type: 'true_false',
          prompt: 'Emergency exit doors must remain clear and unblocked at all times, with no exceptions.',
          points: 10,
          explanation: 'OSHA and building safety codes require exit pathways to be completely unobstructed 24/7.',
          options: [
            { id: 'true', text: 'True' },
            { id: 'false', text: 'False' }
          ],
          correctAnswer: 'true'
        },
        {
          id: 'q3',
          type: 'multiple_choice',
          prompt: 'Which of the following are recognized safety hazard signs you must report immediately? (Select all that apply)',
          points: 15,
          explanation: 'Spills, frayed cords, and blocked exits are clear hazards that require immediate intervention.',
          options: [
            { id: 'opt_1', text: 'Wet flooring without warning signage' },
            { id: 'opt_2', text: 'Frayed electrical cords or smoking equipment' },
            { id: 'opt_3', text: 'Blocked fire extinguisher stations' },
            { id: 'opt_4', text: 'Clean and organized storage shelves' }
          ],
          correctAnswer: ['opt_1', 'opt_2', 'opt_3']
        },
        {
          id: 'q4',
          type: 'short_answer',
          prompt: 'What common 3-word safety term stands for PPE? (Personal ...)',
          points: 15,
          explanation: 'PPE stands for Personal Protective Equipment.',
          acceptedAnswers: [
            'personal protective equipment',
            'Personal Protective Equipment',
            'Personal protective equipment'
          ]
        }
      ]
    }
  ],
  submissions: [
    {
      id: 'sub-sample-1',
      quizId: 'quiz-1',
      quizTitle: 'Company Core Values & Team Culture',
      userEmail: 'sarah@company.com',
      firstName: 'Sarah',
      score: 50,
      maxScore: 50,
      percentage: 100,
      passed: true,
      passingScorePercentage: 75,
      timeSpentSeconds: 245,
      submittedAt: new Date(Date.now() - 3600000 * 4).toISOString(),
      answers: {
        q1: {
          userAnswer: 'opt_2',
          correct: true,
          pointsAwarded: 10,
          maxPoints: 10
        },
        q2: {
          userAnswer: ['opt_1', 'opt_2', 'opt_3'],
          correct: true,
          pointsAwarded: 15,
          maxPoints: 15
        },
        q3: {
          userAnswer: 'false',
          correct: true,
          pointsAwarded: 10,
          maxPoints: 10
        },
        q4: {
          userAnswer: 'Integrity',
          correct: true,
          pointsAwarded: 15,
          maxPoints: 15
        }
      }
    },
    {
      id: 'sub-sample-2',
      quizId: 'quiz-2',
      quizTitle: 'Workplace Safety & Emergency Preparedness',
      userEmail: 'alex@company.com',
      firstName: 'Alex',
      score: 35,
      maxScore: 50,
      percentage: 70,
      passed: false,
      passingScorePercentage: 80,
      timeSpentSeconds: 310,
      submittedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
      answers: {
        q1: {
          userAnswer: 'opt_2',
          correct: true,
          pointsAwarded: 10,
          maxPoints: 10
        },
        q2: {
          userAnswer: 'true',
          correct: true,
          pointsAwarded: 10,
          maxPoints: 10
        },
        q3: {
          userAnswer: ['opt_1', 'opt_2'], // partial
          correct: false,
          pointsAwarded: 0,
          maxPoints: 15
        },
        q4: {
          userAnswer: 'Personal Protective Equipment',
          correct: true,
          pointsAwarded: 15,
          maxPoints: 15
        }
      }
    }
  ]
};

function ensureDir(filePath) {
  const dirname = path.dirname(filePath);
  if (!fs.existsSync(dirname)) {
    fs.mkdirSync(dirname, { recursive: true });
  }
}

let inMemoryCache = null;

function readDb() {
  try {
    ensureDir(DB_FILE);
    if (!fs.existsSync(DB_FILE)) {
      // If deployed on Vercel and local repo db.json exists, copy from it
      let seed = INITIAL_DATA;
      if (IS_VERCEL && fs.existsSync(LOCAL_DB_FILE)) {
        try {
          seed = JSON.parse(fs.readFileSync(LOCAL_DB_FILE, 'utf-8'));
        } catch (e) {
          seed = INITIAL_DATA;
        }
      }
      fs.writeFileSync(DB_FILE, JSON.stringify(seed, null, 2), 'utf-8');
      inMemoryCache = JSON.parse(JSON.stringify(seed));
      return inMemoryCache;
    }
    const data = fs.readFileSync(DB_FILE, 'utf-8');
    const parsed = JSON.parse(data);
    inMemoryCache = parsed;
    return parsed;
  } catch (err) {
    console.error('Error reading db.json, returning fallback cache:', err);
    return inMemoryCache || JSON.parse(JSON.stringify(INITIAL_DATA));
  }
}

function writeDb(data) {
  inMemoryCache = data;
  try {
    ensureDir(DB_FILE);
    const tempFile = `${DB_FILE}.${Date.now()}.tmp`;
    fs.writeFileSync(tempFile, JSON.stringify(data, null, 2), 'utf-8');
    fs.renameSync(tempFile, DB_FILE);
    return true;
  } catch (err) {
    console.error('Error writing temp db.json, attempting direct write:', err);
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
      return true;
    } catch (writeErr) {
      console.error('Direct write failed, kept in memory:', writeErr);
      return true;
    }
  }
}

// Helper methods
const db = {
  getData: () => readDb(),
  saveData: (data) => writeDb(data),

  // Auth / Whitelist
  isEmailAuthorized: (email) => {
    const data = readDb();
    const cleanEmail = (email || '').trim().toLowerCase();
    // Admin is always authorized
    if (cleanEmail === (data.admin.email || '').toLowerCase()) {
      return { authorized: true, role: 'admin', record: data.admin };
    }
    const match = data.authorizedEmails.find(
      (item) => item.email.toLowerCase() === cleanEmail
    );
    if (match) {
      return { authorized: true, role: 'member', record: match };
    }
    return { authorized: false };
  },

  getAuthorizedEmails: () => {
    return readDb().authorizedEmails;
  },

  addAuthorizedEmail: ({ email, firstName = '', notes = '' }) => {
    const data = readDb();
    const cleanEmail = email.trim().toLowerCase();
    const existing = data.authorizedEmails.find(
      (item) => item.email.toLowerCase() === cleanEmail
    );
    if (existing) {
      throw new Error(`Email "${email}" is already authorized.`);
    }
    const newEntry = {
      id: 'auth-' + crypto.randomUUID(),
      email: cleanEmail,
      firstName: firstName.trim(),
      role: 'member',
      notes: notes.trim(),
      addedAt: new Date().toISOString()
    };
    data.authorizedEmails.push(newEntry);
    writeDb(data);
    return newEntry;
  },

  addBatchAuthorizedEmails: (emailsList) => {
    const data = readDb();
    const added = [];
    const skipped = [];

    emailsList.forEach((item) => {
      const email = typeof item === 'string' ? item : item.email;
      const firstName = typeof item === 'string' ? '' : item.firstName || '';
      const notes = typeof item === 'string' ? '' : item.notes || '';
      const cleanEmail = (email || '').trim().toLowerCase();

      if (!cleanEmail || !cleanEmail.includes('@')) {
        skipped.push({ email, reason: 'Invalid email format' });
        return;
      }

      const existing = data.authorizedEmails.find(
        (a) => a.email.toLowerCase() === cleanEmail
      );
      if (existing) {
        skipped.push({ email: cleanEmail, reason: 'Already exists' });
        return;
      }

      const newEntry = {
        id: 'auth-' + crypto.randomUUID(),
        email: cleanEmail,
        firstName: firstName.trim(),
        role: 'member',
        notes: notes.trim(),
        addedAt: new Date().toISOString()
      };
      data.authorizedEmails.push(newEntry);
      added.push(newEntry);
    });

    writeDb(data);
    return { added, skipped };
  },

  updateAuthorizedEmail: (id, updates) => {
    const data = readDb();
    const index = data.authorizedEmails.findIndex((item) => item.id === id);
    if (index === -1) {
      throw new Error('Authorized email not found');
    }
    data.authorizedEmails[index] = {
      ...data.authorizedEmails[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    writeDb(data);
    return data.authorizedEmails[index];
  },

  deleteAuthorizedEmail: (id) => {
    const data = readDb();
    const initialLen = data.authorizedEmails.length;
    data.authorizedEmails = data.authorizedEmails.filter((item) => item.id !== id);
    if (data.authorizedEmails.length === initialLen) {
      throw new Error('Authorized email not found');
    }
    writeDb(data);
    return true;
  },

  // Quizzes
  getQuizzes: (onlyPublished = false) => {
    const data = readDb();
    if (onlyPublished) {
      return data.quizzes.filter((q) => q.status === 'published');
    }
    return data.quizzes;
  },

  getQuizById: (id) => {
    const data = readDb();
    return data.quizzes.find((q) => q.id === id);
  },

  createQuiz: (quizData) => {
    const data = readDb();
    const newQuiz = {
      id: 'quiz-' + crypto.randomUUID(),
      title: quizData.title || 'Untitled Quiz',
      description: quizData.description || '',
      category: quizData.category || 'General',
      timeLimitMinutes: Number(quizData.timeLimitMinutes) || 0,
      passingScorePercentage: Number(quizData.passingScorePercentage) || 70,
      status: quizData.status || 'published',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      questions: (quizData.questions || []).map((q) => ({
        id: q.id || 'q-' + crypto.randomUUID(),
        type: q.type || 'single_choice',
        prompt: q.prompt || '',
        points: Number(q.points) || 10,
        explanation: q.explanation || '',
        options: q.options || [],
        correctAnswer: q.correctAnswer,
        acceptedAnswers: q.acceptedAnswers || []
      }))
    };
    data.quizzes.unshift(newQuiz);
    writeDb(data);
    return newQuiz;
  },

  updateQuiz: (id, quizData) => {
    const data = readDb();
    const index = data.quizzes.findIndex((q) => q.id === id);
    if (index === -1) {
      throw new Error('Quiz not found');
    }
    data.quizzes[index] = {
      ...data.quizzes[index],
      ...quizData,
      updatedAt: new Date().toISOString(),
      questions: (quizData.questions || []).map((q) => ({
        id: q.id || 'q-' + crypto.randomUUID(),
        type: q.type || 'single_choice',
        prompt: q.prompt || '',
        points: Number(q.points) || 10,
        explanation: q.explanation || '',
        options: q.options || [],
        correctAnswer: q.correctAnswer,
        acceptedAnswers: q.acceptedAnswers || []
      }))
    };
    writeDb(data);
    return data.quizzes[index];
  },

  deleteQuiz: (id) => {
    const data = readDb();
    const index = data.quizzes.findIndex((q) => q.id === id);
    if (index === -1) {
      throw new Error('Quiz not found');
    }
    data.quizzes.splice(index, 1);
    writeDb(data);
    return true;
  },

  // Submissions
  getSubmissions: (filters = {}) => {
    const data = readDb();
    let list = [...data.submissions];
    if (filters.quizId) {
      list = list.filter((s) => s.quizId === filters.quizId);
    }
    if (filters.userEmail) {
      list = list.filter((s) => s.userEmail.toLowerCase() === filters.userEmail.toLowerCase());
    }
    return list.sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));
  },

  getSubmissionById: (id) => {
    const data = readDb();
    return data.submissions.find((s) => s.id === id);
  },

  createSubmission: ({ quizId, userEmail, firstName, answers, timeSpentSeconds }) => {
    const data = readDb();
    const quiz = data.quizzes.find((q) => q.id === quizId);
    if (!quiz) {
      throw new Error('Quiz not found');
    }

    let totalScore = 0;
    let maxScore = 0;
    const evaluatedAnswers = {};

    quiz.questions.forEach((q) => {
      const qPoints = Number(q.points) || 10;
      maxScore += qPoints;
      const userAns = answers ? answers[q.id] : undefined;

      let isCorrect = false;

      if (q.type === 'single_choice' || q.type === 'true_false') {
        isCorrect = userAns !== undefined && String(userAns).trim() === String(q.correctAnswer).trim();
      } else if (q.type === 'multiple_choice') {
        const correctSet = new Set((q.correctAnswer || []).map(String));
        const userSet = new Set((Array.isArray(userAns) ? userAns : []).map(String));
        if (correctSet.size === userSet.size) {
          isCorrect = true;
          for (let val of correctSet) {
            if (!userSet.has(val)) {
              isCorrect = false;
              break;
            }
          }
        }
      } else if (q.type === 'short_answer' || q.type === 'fill_blank') {
        const userTrimmed = (userAns || '').toString().trim().toLowerCase();
        const validList = (q.acceptedAnswers || [q.correctAnswer || '']).map((a) =>
          String(a).trim().toLowerCase()
        );
        isCorrect = validList.includes(userTrimmed);
      }

      const pointsAwarded = isCorrect ? qPoints : 0;
      totalScore += pointsAwarded;

      evaluatedAnswers[q.id] = {
        userAnswer: userAns,
        correct: isCorrect,
        pointsAwarded,
        maxPoints: qPoints,
        explanation: q.explanation || '',
        correctAnswer: q.correctAnswer,
        acceptedAnswers: q.acceptedAnswers
      };
    });

    const percentage = maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 100;
    const passed = percentage >= (quiz.passingScorePercentage || 70);

    const newSubmission = {
      id: 'sub-' + crypto.randomUUID(),
      quizId,
      quizTitle: quiz.title,
      userEmail: (userEmail || '').trim().toLowerCase(),
      firstName: (firstName || '').trim(),
      score: totalScore,
      maxScore,
      percentage,
      passed,
      passingScorePercentage: quiz.passingScorePercentage || 70,
      timeSpentSeconds: Number(timeSpentSeconds) || 0,
      submittedAt: new Date().toISOString(),
      answers: evaluatedAnswers
    };

    data.submissions.unshift(newSubmission);
    writeDb(data);
    return newSubmission;
  },

  // Admin login check
  verifyAdmin: (email, password) => {
    const data = readDb();
    if (
      email.toLowerCase() === data.admin.email.toLowerCase() &&
      password === data.admin.password
    ) {
      return {
        success: true,
        user: {
          email: data.admin.email,
          name: data.admin.name,
          role: 'admin'
        }
      };
    }
    return { success: false, message: 'Invalid admin credentials' };
  }
};

module.exports = db;


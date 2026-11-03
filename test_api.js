const http = require('http');

function request(options, body = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        let json = null;
        try {
          json = JSON.parse(data);
        } catch (e) {
          json = data;
        }
        resolve({ status: res.statusCode, headers: res.headers, data: json });
      });
    });
    req.on('error', reject);
    if (body) {
      req.write(typeof body === 'string' ? body : JSON.stringify(body));
    }
    req.end();
  });
}

async function runTests() {
  console.log('--- Starting Automated System Tests ---');

  // 1. Health check
  const health = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/health',
    method: 'GET'
  });
  console.log('1. Health check status:', health.status, health.data);
  if (health.status !== 200) throw new Error('Health check failed');

  // 2. Member login with unauthorized email (should fail with 403)
  const unauthLogin = await request(
    {
      hostname: 'localhost',
      port: 5000,
      path: '/api/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    },
    { email: 'stranger@random.com', firstName: 'Stranger' }
  );
  console.log('2. Unauthorized login rejection test (expected 403):', unauthLogin.status, unauthLogin.data);
  if (unauthLogin.status !== 403) throw new Error('Unauthorized login was not rejected');

  // 3. Member login with authorized email (should succeed)
  const authLogin = await request(
    {
      hostname: 'localhost',
      port: 5000,
      path: '/api/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    },
    { email: 'sarah@company.com', firstName: 'Sarah' }
  );
  console.log('3. Authorized login test (expected 200):', authLogin.status, authLogin.data.user);
  if (authLogin.status !== 200 || !authLogin.data.success) throw new Error('Authorized login failed');

  // 4. Admin login
  const adminLogin = await request(
    {
      hostname: 'localhost',
      port: 5000,
      path: '/api/auth/admin-login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    },
    { email: 'admin@company.com', password: 'admin' }
  );
  console.log('4. Admin login test (expected 200):', adminLogin.status, adminLogin.data.user);
  if (adminLogin.status !== 200) throw new Error('Admin login failed');

  // 5. Admin adds a new authorized email
  const testEmail = `newmember_${Date.now()}@company.com`;
  const addAuth = await request(
    {
      hostname: 'localhost',
      port: 5000,
      path: '/api/whitelist',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    },
    { email: testEmail, firstName: 'Newbie', notes: 'QA Testing' }
  );
  console.log('5. Add authorized email test:', addAuth.status, addAuth.data.email);
  if (addAuth.status !== 201) throw new Error('Adding authorized email failed');

  // 6. Login with newly authorized email
  const newMemberLogin = await request(
    {
      hostname: 'localhost',
      port: 5000,
      path: '/api/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    },
    { email: testEmail, firstName: 'Newbie' }
  );
  console.log('6. Login with newly added email (expected 200):', newMemberLogin.status, newMemberLogin.data.user);
  if (newMemberLogin.status !== 200) throw new Error('New member login failed');

  // 7. Get quizzes list
  const quizzesRes = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/quizzes',
    method: 'GET'
  });
  console.log('7. Quizzes count:', quizzesRes.data.length);
  const sampleQuiz = quizzesRes.data[0];

  // 8. Create a custom quiz with multiple question types
  const newQuizRes = await request(
    {
      hostname: 'localhost',
      port: 5000,
      path: '/api/quizzes',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    },
    {
      title: 'Customer Service Essentials 2026',
      description: 'Comprehensive test of hospitality, etiquette, and conflict resolution.',
      category: 'Hospitality',
      timeLimitMinutes: 15,
      passingScorePercentage: 75,
      status: 'published',
      questions: [
        {
          id: 'q1',
          type: 'single_choice',
          prompt: 'What is the optimal greeting time for arriving guests?',
          points: 10,
          explanation: '30 seconds is the industry benchmark for standard first impressions.',
          options: [
            { id: 'opt1', text: 'Within 30 seconds' },
            { id: 'opt2', text: 'Within 5 minutes' }
          ],
          correctAnswer: 'opt1'
        },
        {
          id: 'q2',
          type: 'true_false',
          prompt: 'Eye contact is an essential component of active listening.',
          points: 10,
          explanation: 'Non-verbal cues like eye contact convey empathy and attentiveness.',
          options: [
            { id: 'true', text: 'True' },
            { id: 'false', text: 'False' }
          ],
          correctAnswer: 'true'
        },
        {
          id: 'q3',
          type: 'short_answer',
          prompt: 'Type the magic word in customer service: (starts with "P")',
          points: 10,
          explanation: '"Please" and "Thank you" are non-negotiable courtesy standards.',
          acceptedAnswers: ['please', 'Please', 'PLEASE']
        }
      ]
    }
  );
  console.log('8. Create quiz test (expected 201):', newQuizRes.status, newQuizRes.data.title);
  if (newQuizRes.status !== 201) throw new Error('Create quiz failed');

  // 9. Edit the quiz
  const editQuizRes = await request(
    {
      hostname: 'localhost',
      port: 5000,
      path: `/api/quizzes/${newQuizRes.data.id}`,
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' }
    },
    {
      ...newQuizRes.data,
      title: 'Customer Service & Hospitality Mastery 2026'
    }
  );
  console.log('9. Edit quiz test (expected 200):', editQuizRes.status, editQuizRes.data.title);
  if (editQuizRes.status !== 200) throw new Error('Edit quiz failed');

  // 10. Submit a quiz attempt
  const submitRes = await request(
    {
      hostname: 'localhost',
      port: 5000,
      path: '/api/submissions',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    },
    {
      quizId: newQuizRes.data.id,
      userEmail: testEmail,
      firstName: 'Newbie',
      timeSpentSeconds: 140,
      answers: {
        q1: 'opt1', // correct (+10)
        q2: 'true', // correct (+10)
        q3: 'Please' // correct (+10)
      }
    }
  );
  console.log('10. Quiz submission result (expected 100% Passed):', {
    score: submitRes.data.score,
    maxScore: submitRes.data.maxScore,
    percentage: submitRes.data.percentage,
    passed: submitRes.data.passed
  });
  if (submitRes.status !== 201 || submitRes.data.percentage !== 100 || !submitRes.data.passed) {
    throw new Error('Quiz evaluation failed');
  }

  // 11. Verify the submission appears in Admin Stats & Submissions Feed
  const statsRes = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/stats',
    method: 'GET'
  });
  console.log('11. Admin dashboard stats:', {
    totalQuizzes: statsRes.data.totalQuizzes,
    totalAuthorizedMembers: statsRes.data.totalAuthorizedMembers,
    totalSubmissions: statsRes.data.totalSubmissions,
    averageScore: statsRes.data.averageScore
  });
  const foundInFeed = statsRes.data.recentSubmissions.some((s) => s.id === submitRes.data.id);
  console.log('    New submission visible in admin live feed:', foundInFeed);
  if (!foundInFeed) throw new Error('Submission not found in admin recent feed');

  // 12. Check frontend index.html served
  const frontendRes = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/',
    method: 'GET'
  });
  console.log('12. Frontend SPA index.html served (status):', frontendRes.status);
  if (frontendRes.status !== 200) throw new Error('Frontend not served');

  console.log('\n ALL 12 TESTS PASSED PERFECTLY! Platform is fully operational.');
}

runTests().catch((err) => {
  console.error('Test error:', err);
  process.exit(1);
});


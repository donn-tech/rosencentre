const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

const authRoutes = require('./routes/auth');
const quizRoutes = require('./routes/quizzes');
const submissionRoutes = require('./routes/submissions');
const whitelistRoutes = require('./routes/whitelist');
const statsRoutes = require('./routes/stats');

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Request logger
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString().slice(11, 19)}] ${req.method} ${req.originalUrl}`);
  next();
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/quizzes', quizRoutes);
app.use('/api/submissions', submissionRoutes);
app.use('/api/whitelist', whitelistRoutes);
app.use('/api/stats', statsRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Serve frontend static build if available (used in local single-port mode)
const distPath = path.join(__dirname, '..', 'client', 'dist');
app.use(express.static(distPath));

// Fallback to client index.html for local single-port mode SPA routing
app.use((req, res) => {
  if (req.originalUrl.startsWith('/api')) {
    return res.status(404).json({ error: 'API route not found' });
  }
  const indexPath = path.join(distPath, 'index.html');
  res.sendFile(indexPath, (err) => {
    if (err) {
      res.status(200).send(`
        <html>
          <head><title>Team Quiz Platform API</title></head>
          <body style="font-family: sans-serif; padding: 40px; text-align: center;">
            <h2>Team Quiz Platform API is running!</h2>
            <p>Vite dev server runs at <a href="http://localhost:5173">http://localhost:5173</a> during development.</p>
          </body>
        </html>
      `);
    }
  });
});

module.exports = app;


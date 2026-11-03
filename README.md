# TeamQuiz Pro — Team Assessment & Quiz Platform

A full-stack, enterprise-grade quiz application built for teams. Allows administrators to create and edit custom quizzes with diverse question types, manage an authorized email whitelist, enforce team authentication with first names, and track all quiz attempts and results in real time.

---

## 🚀 Quick Start

### 1. Start the Platform
```bash
npm start
```
The server will start at **http://localhost:5000**, serving both the REST API and the responsive client web application.

### 2. (Optional) Run with Live Hot Reload in Development
To run frontend and backend in development mode:
```bash
# Terminal 1: Backend API
npm run server

# Terminal 2: Vite React Frontend (HMR)
npm run client
```

---

## 🔑 Default Credentials for Instant Testing

### 🛡️ Administrator Account
- **Email:** `admin@company.com`
- **Password:** `admin`
*(You can also click the **"Autofill Default Admin Credentials"** button on the login screen for 1-click access)*

### 👥 Pre-Authorized Team Member Accounts
Any team member must log in with their **First Name** and an **Authorized Email**:
- **Sarah:** `sarah@company.com`
- **Alex:** `alex@company.com`
- **Michael:** `michael@company.com`
- **Taylor:** `team@company.com`
*(Pre-filled 1-click chips are available directly on the login card for fast demonstration)*

---

## ✨ Features Breakdown

### 1. Authorized Email Management (Admin Dashboard)
- **Whitelist Enforcement:** Only team members whose emails have been added by the admin can log in and take quizzes. Any unauthorized email is immediately blocked with a clear access denial notice.
- **Add Single Member:** Enter email, first name, and department/role notes.
- **Batch Import:** Paste a list of multiple email addresses separated by commas, semicolons, or newlines to authorize entire teams at once.
- **Member Activity Tracking:** View how many quizzes each authorized member has completed and their average score.
- **1-Click Test Login:** Admin can test-login as any authorized member directly from the whitelist table.

### 2. User Login with First Name
- Prompts team members for both their **First Name** and **Work Email**.
- First name is dynamically displayed on their dashboard, quiz certificates, result screens, and logged into the admin dashboard completion records.

### 3. Quiz Creation & Editing
- **Create & Edit Quizzes:** Full control over title, description, category, time limits (in minutes, or unlimited), passing score percentage (e.g. 70%), and status (Published vs Draft).
- **Supports Multiple Question Types:**
  1. **Single Choice (Radio):** Standard multiple-choice with one correct answer.
  2. **Multiple Select (Checkboxes):** Multi-correct question requiring the candidate to pick all correct answers.
  3. **True / False:** Binary proposition with True / False selection.
  4. **Short Answer (Text Match):** User types their answer into a text field, checked against accepted answer synonyms (case-insensitive).
  5. **Fill in the Blank:** Sentence completion with accepted word list.
- **Points Allocation:** Customize point values per question.
- **Explanations:** Add educational explanations to help team members learn upon review.
- **Reordering & Duplication:** Move questions up/down or duplicate existing questions with 1 click.

### 4. Interactive Quiz Taking Experience
- Clean, focused interface with timer countdown clock (with low-time warning).
- Real-time progress bar and question navigation jump bar.
- Unanswered questions warning prior to submission confirmation.

### 5. Immediate Results Screen
- Automatic calculation of score, percentage, and pass/fail determination.
- Celebratory confetti animation on passing.
- Complete question-by-question breakdown:
  - Question prompt & points.
  - Candidate's submitted answer.
  - Correct answer revealed.
  - Full explanation and rationale.
- Retake assessment option.

### 6. Admin Analytics & Completions Dashboard
- **Executive Metrics:** Total quizzes, authorized members, total completions, team average score, and pass rate.
- **Live Completions Feed:** Every time a member finishes a quiz, it is logged and visible in the admin feed.
- **Inspect Answer Sheets:** Open any submission to review the member's complete answer sheet.
- **Filter & Search:** Filter submissions by quiz topic or pass/fail result, and search by member name or email.
- **Export to CSV:** Download all completion records for reporting and HR tracking.

---

## 🛠️ Architecture & Tech Stack

- **Frontend:** React 18, Vite, Tailwind CSS, Lucide Icons, Canvas Confetti.
- **Backend:** Node.js, Express, CORS.
- **Persistence:** Atomic JSON database engine (`server/data/db.json`) with zero external native compilation requirements.
- **Single-Port Deployment:** Express automatically serves both the API endpoints (`/api/*`) and the built React SPA frontend on port `5000`.


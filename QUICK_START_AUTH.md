# 🚀 Quick Start Guide: Authentication & Memory System

## Getting Started in 3 Steps

### Step 1: Start the Backend
```bash
cd "/Users/rafi/Downloads/Project Chimera/backend"
python main_agents.py
```
✅ Backend running at: http://localhost:8000

### Step 2: Start the Frontend
```bash
cd "/Users/rafi/Downloads/Project Chimera/frontend-react"
npm run dev
```
✅ Frontend running at: http://localhost:5173

### Step 3: Open the App
Open browser to: **http://localhost:5173**

---

## 🎯 Using the Authentication System

### Option 1: Create an Account
1. Click **"Register"** tab
2. Enter your email (e.g., `scientist@nasa.gov`)
3. Enter a password (min 6 characters)
4. Click **"Register"**
5. ✅ You're automatically logged in!

### Option 2: Login to Existing Account
1. Click **"Login"** tab
2. Enter your email
3. Enter your password
4. Click **"Login"**
5. ✅ Welcome back!

### Option 3: Continue Without Login
1. Click **"Continue without login"**
2. ✅ Use the app without an account (no preferences saved)

---

## 🧠 Auto-Learning Features (Authenticated Users)

### What Gets Learned Automatically:

#### 1. **Preferred Persona**
- System tracks which persona you use most
- Options: Research Scientist, Mission Architect, Manager
- Automatically sets your preferred persona
- Example: After 10 queries, 7 with "Research Scientist" → that becomes your preferred persona

#### 2. **Favorite Topics**
- System tracks topics from your queries
- Extracted from "Highlighted Concepts"
- Tracks frequency of each topic
- Example: Query about microgravity → "microgravity" count increases

#### 3. **Usage Statistics**
- Total number of queries
- Last active timestamp
- Persona usage breakdown
- Topic frequency map

#### 4. **Chat History**
- Every chat message saved
- Last 5 messages used for context
- Persistent across sessions
- Context-aware AI responses

---

## 📊 Seeing Your Data

### Current User Info:
Look in the **sidebar** (left panel):
- 👤 Your email address
- Logout button

### Check Your Stats (API):
```bash
# Get your token after login, then:
curl -X GET http://localhost:8000/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

Response:
```json
{
  "id": 1,
  "email": "scientist@nasa.gov",
  "preferred_persona": "Research Scientist",
  "usage_count": 15
}
```

---

## 🎭 Testing the System

### Test 1: Persona Learning
1. Login or register
2. Make 5 queries with "Research Scientist" persona
3. Make 2 queries with "Manager" persona
4. Check `/auth/me` - preferred_persona should be "Research Scientist"

### Test 2: Chat Memory
1. Login or register
2. Ask chatbot: "What is microgravity?"
3. Then ask: "Tell me more about that" (no context given)
4. ✅ AI remembers previous conversation!

### Test 3: Topic Tracking
1. Login or register
2. Search: "microgravity effects on plants"
3. Search: "radiation biology in space"
4. Search: "microgravity bone density"
5. Check database - "microgravity" should have count of 2

---

## 🔧 Troubleshooting

### Issue: "Not authenticated" error
**Solution**: Make sure you're logged in. Check sidebar for user email.

### Issue: Chat doesn't remember context
**Solution**: Only works for authenticated users. Login or register first.

### Issue: Preferences not saving
**Solution**: Make sure backend is running and database file exists:
```bash
ls -la backend/project_chimera.db
```

### Issue: Can't login
**Solution**: Check backend logs:
```bash
tail -50 backend/backend.log
```

### Issue: Frontend won't start
**Solution**: Check if port 5173 is available:
```bash
lsof -ti:5173 | xargs kill -9  # Kill any process on port 5173
npm run dev
```

---

## 🎨 UI Features

### Login Screen:
- **Tab Switching**: Toggle between Login/Register
- **Skip Option**: Continue without account
- **Error Display**: Clear error messages
- **Loading State**: "Processing..." during API calls

### Main App (Authenticated):
- **User Badge**: Email displayed in sidebar
- **Logout Button**: Sign out anytime
- **Persistent State**: Login survives page refresh

### Main App (Guest):
- **Login Prompt**: "🔐 Login to save preferences" button
- **Full Functionality**: All features work without account

---

## 📱 Example Workflow

### Scenario: Research Scientist Daily Use

**Day 1** (First Time):
1. Open app → See login screen
2. Register: `dr.smith@nasa.gov` / `science123`
3. ✅ Logged in, see email in sidebar
4. Select "Research Scientist" persona
5. Query: "What are the effects of microgravity on muscle tissue?"
6. Review results, chat with AI about findings
7. Close browser

**Day 2** (Returning User):
1. Open app → Automatically logged in! (token in localStorage)
2. Query: "How does radiation affect DNA repair?"
3. System learns: Research Scientist used 2x, topics: microgravity, radiation
4. Chat: "What did we discuss yesterday?"
5. ✅ AI remembers previous conversation about microgravity!

**Day 7** (After Many Queries):
1. Open app → Automatically logged in
2. System has learned:
   - Preferred persona: Research Scientist (used 85% of the time)
   - Favorite topics: microgravity (12x), radiation (8x), muscle (5x)
   - Usage count: 20 queries
3. Future features could auto-suggest topics or pre-select persona!

---

## 🔐 Security Best Practices

### For Development:
✅ Currently uses: `SECRET_KEY = "your-secret-key-change-in-production-123456789"`

### For Production:
1. **Change the JWT secret key** in `backend/auth.py`:
```python
SECRET_KEY = os.getenv("JWT_SECRET_KEY")  # Load from environment
```

2. **Use environment variables**:
```bash
export JWT_SECRET_KEY="your-super-secure-random-key-here"
```

3. **Enable HTTPS**: Use SSL/TLS certificates

4. **Add rate limiting**: Prevent brute force attacks

5. **Add password requirements**: Minimum length, complexity

---

## 🎯 API Endpoints Summary

### Authentication:
- `POST /auth/register` - Create account
- `POST /auth/login` - Login
- `GET /auth/me` - Get current user info (requires auth)

### Main Features:
- `POST /query` - Process query (tracks preferences if authenticated)
- `POST /api/chat` - Chat with AI (uses memory if authenticated)
- `GET /health` - Check backend status

### Testing Endpoints:
```bash
# Register
curl -X POST http://localhost:8000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email": "test@nasa.gov", "password": "test123"}'

# Login
curl -X POST http://localhost:8000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "test@nasa.gov", "password": "test123"}'

# Get user info
curl -X GET http://localhost:8000/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 💾 Database Location

**File**: `backend/project_chimera.db`

**View with**: DB Browser for SQLite (recommended)

**Tables**:
- `users` - User accounts
- `chat_sessions` - Conversation history
- `user_preferences` - Query preferences

**Backup**:
```bash
cp backend/project_chimera.db backend/project_chimera.db.backup
```

---

## 🎉 You're All Set!

The authentication system is now fully operational. Key features:

✅ Email/password authentication
✅ JWT token security
✅ Automatic preference learning
✅ Chat memory with LangChain
✅ Beautiful login UI
✅ Optional authentication (can skip)
✅ Persistent sessions
✅ Auto-tracking of persona usage
✅ Auto-tracking of favorite topics

**Start the servers and try it out!** 🚀

Questions? Check `AUTH_SYSTEM_SUMMARY.md` for detailed documentation.

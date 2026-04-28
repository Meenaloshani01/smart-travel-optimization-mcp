# 🚀 Quick Setup Guide

## Prerequisites
- Python 3.10 or higher
- Node.js 18 or higher
- Git

## One-Command Setup (Windows)

### Option 1: PowerShell Script
```powershell
# Backend setup
cd backend
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
python -c "from database.db_manager import DatabaseManager; db = DatabaseManager(); db.initialize_database()"

# Frontend setup (in new terminal)
npm install

# Run tests
cd backend
pytest tests/ -v
```

### Option 2: Step-by-Step

#### 1. Backend Setup (5 minutes)
```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
```

#### 2. Initialize Database
```bash
python -c "from database.db_manager import DatabaseManager; db = DatabaseManager(); db.initialize_database()"
```

#### 3. Frontend Setup (3 minutes)
```bash
# In project root
npm install
```

#### 4. Verify Installation
```bash
# Test backend
cd backend
pytest tests/test_guardrails.py::TestLocationValidation::test_valid_location -v

# Should see: 1 passed
```

## Running the Application

### Terminal 1 - Backend
```bash
cd backend
venv\Scripts\activate
python run.py
```
✅ Backend running on http://localhost:5000

### Terminal 2 - Frontend
```bash
npm run dev
```
✅ Frontend running on http://localhost:5173

### Terminal 3 - Tests (Optional)
```bash
cd backend
pytest tests/ -v --cov=. --cov-report=html
```
✅ Tests running, coverage report in `htmlcov/index.html`

## Quick Test

1. Open browser: http://localhost:5173
2. Click "Get Started"
3. Enter:
   - From: Puducherry
   - To: Ooty
   - Budget: 5000
4. Click "Plan Journey"
5. See AI-powered recommendations! 🎉

## Troubleshooting

### Backend won't start
```bash
# Check Python version
python --version  # Should be 3.10+

# Reinstall dependencies
pip install -r requirements.txt --force-reinstall
```

### Frontend won't start
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Tests failing
```bash
# Install test dependencies
pip install pytest pytest-asyncio pytest-cov

# Run with verbose output
pytest tests/ -vv
```

### Database errors
```bash
# Reinitialize database
python -c "from database.db_manager import DatabaseManager; db = DatabaseManager(); db.initialize_database()"
```

## Verification Checklist

- [ ] Python 3.10+ installed
- [ ] Node.js 18+ installed
- [ ] Backend dependencies installed
- [ ] Frontend dependencies installed
- [ ] Database initialized
- [ ] Backend starts on port 5000
- [ ] Frontend starts on port 5173
- [ ] Tests pass (85+ tests)
- [ ] Application loads in browser

## Next Steps

1. ✅ Setup complete
2. 📖 Read README.md for detailed documentation
3. 🧪 Run tests: `pytest tests/ -v`
4. 🎯 Try the application
5. 📊 Check EVALUATION_CHECKLIST.md for project details

## Support

- **Documentation**: README.md
- **Tests**: backend/tests/
- **Logs**: backend/smart_travel.log
- **Coverage**: backend/htmlcov/index.html (after running tests with --cov)

---

**Setup Time**: ~10 minutes
**Status**: Ready for evaluation! 🏆

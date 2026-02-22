# Virtual Memory Companion - Complete Project Guide

## 🎯 Project Overview

The Virtual Memory Companion is an intelligent web-based system to help Alzheimer's and dementia patients recall memories, recognize faces, and maintain emotional connections.

### Technology Stack
- **Frontend**: React.js + Vite
- **Backend**: Node.js + Express.js
- **Database**: PostgreSQL
- **AI Integration**: DeepFace, BLIP, Whisper, SentenceTransformers (planned)

---

## 🚀 How to Run This Project

### Prerequisites

1. **Node.js** v20.19+
   ```bash
   nvm use 20.19.5
   ```

2. **PostgreSQL** v14+
   ```bash
   brew install postgresql@14
   brew services start postgresql@14
   ```

3. **npm** (comes with Node.js)

---

## Running the Frontend

### Step 1: Navigate to Frontend
```bash
cd /Users/mac/Desktop/Vamora/frontend
```

### Step 2: Install Dependencies (if not already done)
```bash
npm install
```

### Step 3: Start Development Server
```bash
npm run dev
```

### Step 4: Access Application
- Open browser: **http://localhost:5173**
- Default landing page shows Role Selection
- Features implemented:
  - ✅ Role Selection Page
  - ✅ Patient Dashboard
  - ✅ Live date/time display
  - ✅ Large button interface
  - ✅ Accessibility features

---

## Running the Backend

### Step 1: Navigate to Backend
```bash
cd /Users/mac/Desktop/Vamora/backend
```

### Step 2: Install Dependencies (if not already done)
```bash
npm install
```

### Step 3: Create Database
```bash
# Option 1: Use setup script
./setup-database.sh

# Option 2: Manual setup
psql postgres
CREATE DATABASE vamora_db;
CREATE USER vamora_user WITH PASSWORD 'vamora_secure_password_2026';
GRANT ALL PRIVILEGES ON DATABASE vamora_db TO vamora_user;
\q
```

### Step 4: Run Migrations (when created)
```bash
npm run db:migrate
```

### Step 5: Start Development Server
```bash
npm run dev
```

### Step 6: Access API
- Server: **http://localhost:5000**
- Health check: **http://localhost:5000/health**
- API documentation: **http://localhost:5000/api**

---

## 📊 Project Status

### Frontend ✅ COMPLETE

| Feature | Status |
|---------|--------|
| Project Setup | ✅ Complete |
| Role Selection Page | ✅ Complete |
| Patient Dashboard | ✅ Complete |
| Live Clock & Date | ✅ Complete |
| Action Buttons (3) | ✅ Complete |
| Responsive Design | ✅ Complete |
| Accessibility Features | ✅ Complete |
| Routing (React Router) | ✅ Complete |

### Backend 🚧 IN PROGRESS

| Module | Status |
|--------|--------|
| Project Setup | ✅ Complete |
| Express Server | ✅ Complete |
| Database Config | ✅ Complete |
| Environment Setup | ✅ Complete |
| User Models | 📅 Planned |
| Authentication API | 📅 Planned |
| Media Upload API | 📅 Planned |
| Chat API | 📅 Planned |
| AI Integration | 📅 Planned |

### Database 🚧 SETUP READY

| Component | Status |
|-----------|--------|
| PostgreSQL Install | ✅ Required |
| Database Schema Design | ✅ Complete |
| Sequelize Setup | ✅ Complete |
| Migrations | 📅 To Create |
| Seed Data | 📅 To Create |

---

## 📁 Project Structure

```
Vamora/
├── frontend/                     # React.js Frontend ✅
│   ├── src/
│   │   ├── pages/
│   │   │   ├── RoleSelection.jsx
│   │   │   ├── RoleSelection.css
│   │   │   ├── PatientDashboard.jsx
│   │   │   └── PatientDashboard.css
│   │   ├── App.jsx
│   │   └── index.css
│   package.json
│   └── README.md
│
├── backend/                      # Node.js Backend 🚧
│   ├── src/
│   │   ├── config/              # Configuration files
│   │   ├── controllers/         # API controllers (to create)
│   │   ├── models/              # Database models (to create)
│   │   ├── routes/              # API routes (to create)
│   │   ├── middlewares/         # Middleware (to create)
│   │   ├── services/            # Business logic (to create)
│   │   └── utils/               # Utilities (to create)
│   ├── config/
│   │   └── config.js            # Sequelize config ✅
│   ├── migrations/              # DB migrations (to create)
│   ├── seeders/                 # Seed data (to create)
│   ├── uploads/                 # File uploads folder
│   ├── .env                     # Environment variables ✅
│   ├── server.js                # Main server ✅
│   ├── setup-database.sh        # DB setup script ✅
│   └── README.md
│
└── docs/                        # Documentation ✅
    ├── PROJECT_OVERVIEW.md
    ├── SYSTEM_ARCHITECTURE.md
    └── BACKEND_SETUP_GUIDE.md
```

---

## 🔧 Development Workflow

### Daily Development

1. **Start Frontend** (Terminal 1)
   ```bash
   cd frontend
   npm run dev
   ```

2. **Start Backend** (Terminal 2)
   ```bash
   cd backend
   npm run dev
   ```

3. **Access Applications**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:5000

### Making Changes

#### Frontend Changes
1. Edit files in `/frontend/src/`
2. Changes auto-reload (Hot Module Replacement)
3. Check browser for updates

#### Backend Changes
1. Edit files in `/backend/src/` or `/backend/server.js`
2. Server auto-restarts (nodemon)
3. Test with Postman or curl

---

## 📝 Next Development Steps

### Phase 1: Complete Backend Core (Week 1-2)

1. **Create User Model & Migration**
   ```bash
   cd backend
   npx sequelize-cli model:generate --name User --attributes email:string,password:string,role:string
   ```

2. **Create Patient Model**
   ```bash
   npx sequelize-cli model:generate --name Patient --attributes userId:integer,name:string,dateOfBirth:date
   ```

3. **Implement Authentication**
   - `/src/controllers/authController.js`
   - `/src/routes/authRoutes.js`
   - `/src/middlewares/auth.js`

4. **Test API with Postman**
   - POST `/api/v1/auth/register`
   - POST `/api/v1/auth/login`

### Phase 2: Connect Frontend to Backend (Week 3)

1. **Install Axios in Frontend**
   ```bash
   cd frontend
   npm install axios
   ```

2. **Create API Service**
   - `/frontend/src/services/api.js`

3. **Update Login Page**
   - Replace mock data with real API calls

4. **Test End-to-End**
   - Register new user
   - Login
   - View dashboard

### Phase 3: Media Management (Week 4-5)

1. **Create Media Model**
2. **Implement Upload Endpoint**
3. **Create Media Gallery Component**
4. **Test File Uploads**

### Phase 4: AI Integration (Week 6-8)

1. **Set up Python AI Services**
2. **Create AI Processing Queue**
3. **Implement Face Recognition**
4. **Implement Image Captioning**

---

## 🧪 Testing the Current Setup

### Test Frontend

1. Open browser: http://localhost:5173
2. You should see the Role Selection page
3. Click "I am a Patient"
4. You should see the Patient Dashboard
5. Verify:
   - Large text and buttons
   - Live clock updating
   - Date displaying correctly
   - All 3 action buttons visible

### Test Backend

1. **Health Check**
   ```bash
   curl http://localhost:5000/health
   ```

2. **API Info**
   ```bash
   curl http://localhost:5000/api
   ```

3. **Expected Response**
   ```json
   {
     "status": "success",
     "message": "Welcome to Virtual Memory Companion API",
     "version": "v1",
     "endpoints": {...}
   }
   ```

---

## 🔐 Security Checklist

- [x] Environment variables stored in `.env`
- [x] `.env` added to `.gitignore`
- [x] Helmet.js for HTTP headers
- [x] CORS configured
- [x] Password will be hashed (bcrypt ready)
- [ ] JWT authentication (to implement)
- [ ] Rate limiting (to add)
- [ ] Input validation (to add)

---

## 📚 Documentation Reference

### Main Guides
- [PROJECT_OVERVIEW.md](./PROJECT_OVERVIEW.md) - Complete project description
- [SYSTEM_ARCHITECTURE.md](./SYSTEM_ARCHITECTURE.md) - Architecture diagrams & design
- [BACKEND_SETUP_GUIDE.md](./BACKEND_SETUP_GUIDE.md) - Detailed backend setup

### Specific READMEs
- [frontend/README.md](./frontend/README.md) - Frontend-specific documentation
- [backend/README.md](./backend/README.md) - Backend-specific documentation

---

## 🐛 Common Issues & Solutions

### Issue: Port 5173 already in use
```bash
# Kill the process using the port
lsof -i :5173
kill -9 <PID>
```

### Issue: Port 5000 already in use
```bash
# Kill the process using the port
lsof -i :5000
kill -9 <PID>
```

### Issue: Node version mismatch
```bash
# Switch to correct version
nvm use 20.19.5

# Set as default
nvm alias default 20.19.5
```

### Issue: Cannot connect to PostgreSQL
```bash
# Check if PostgreSQL is running
brew services list

# Start PostgreSQL
brew services start postgresql@14

# Restart PostgreSQL
brew services restart postgresql@14
```

### Issue: Database doesn't exist
```bash
# Create database manually
psql postgres
CREATE DATABASE vamora_db;
\q
```

---

## 💡 Tips for Development

### Frontend Development
- Use React DevTools browser extension
- Check browser console for errors
- Use `console.log()` for debugging
- Components hot-reload automatically

### Backend Development
- Use Postman for API testing
- Check terminal for server logs
- `nodemon` restarts server on changes
- Use `console.log()` for debugging

### Database Development
- Use pgAdmin or DBeaver for GUI
- Test queries in `psql` first
- Always backup before migrations
- Use seed data for testing

---

## 🎓 Learning Resources

### React.js
- [Official React Docs](https://react.dev)
- [React Router](https://reactrouter.com)

### Node.js & Express
- [Express.js Guide](https://expressjs.com/en/guide/routing.html)
- [Node.js Docs](https://nodejs.org/docs)

### PostgreSQL
- [PostgreSQL Tutorial](https://www.postgresqltutorial.com)
- [Sequelize Docs](https://sequelize.org)

### GitHub
- [GitHub Basics](https://guides.github.com)
- [Git Commands](https://training.github.com)

---

## ✅ Current Achievement Summary

### What's Working Now

✅ Complete frontend with 2 screens
✅ Role selection landing page
✅ Patient dashboard with live features
✅ Backend server running successfully
✅ Database configuration ready
✅ Project structure established
✅ Development environment setup  ✅ All documentation created

### What's Next

📅 Create database tables (models & migrations)
📅 Implement user authentication
📅 Connect frontend to backend
📅 Add media upload functionality
📅 Integrate AI services

---

## 🎯 Quick Commands Reference

```bash
# Frontend
cd frontend
npm run dev              # Start frontend server
npm run build            # Build for production

# Backend
cd backend
npm run dev              # Start backend server
npm run db:migrate       # Run database migrations
npm run db:seed          # Seed database
./setup-database.sh      # Setup PostgreSQL database

# Database
psql postgres            # Access PostgreSQL
\l                       # List databases
\c vamora_db            # Connect to database
\dt                      # List tables
\q                       # Quit

# Git
git status               # Check status
git add .                # Stage all changes
git commit -m "message"  # Commit changes
git push                 # Push to remote
```

---

**Project Status**: Core Setup Complete ✅
**Last Updated**: February 22, 2026
**Next Milestone**: Implement Authentication Module

**Ready to continue development! 🚀**

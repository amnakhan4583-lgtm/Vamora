# Backend Setup Guide - Virtual Memory Companion

## Technology Stack

- **Runtime**: Node.js (v20.19+)
- **Framework**: Express.js
- **Database**: PostgreSQL
- **ORM**: Sequelize
- **Authentication**: JWT (JSON Web Tokens)
- **File Upload**: Multer
- **Validation**: Joi
- **Environment**: dotenv

## Backend Modules Overview

### Module 1: Core Setup & Configuration
- Express server setup
- Database connection
- Middleware configuration
- Error handling
- Environment variables

### Module 2: Authentication & Authorization
- User registration
- User login
- JWT token generation/validation
- Role-based access control (RBAC)
- Password hashing (bcrypt)

### Module 3: User Management
- Patient profiles
- Caregiver profiles
- User relationships
- Profile CRUD operations

### Module 4: Media Management
- Photo upload/download
- Video upload/download
- Audio/voice notes
- File validation
- Storage management

### Module 5: AI Integration (Future)
- DeepFace face recognition
- BLIP image captioning
- Whisper speech-to-text
- SentenceTransformers chatbot

### Module 6: Memory & Chat
- Memory retrieval
- Chat history
- Chatbot responses
- Context management

### Module 7: Caregiver Features
- Activity logging
- Notifications
- Collaboration tools
- Patient monitoring

---

## Step-by-Step Setup Instructions

### Prerequisites

1. **Node.js** (v20.19+)
   ```bash
   node --version
   # Should show v20.19.0 or higher
   ```

2. **PostgreSQL** (v14+)
   - Install PostgreSQL on macOS:
   ```bash
   brew install postgresql@14
   brew services start postgresql@14
   ```

3. **npm** (comes with Node.js)
   ```bash
   npm --version
   ```

---

## Phase 1: Initial Project Setup

### Step 1: Create Backend Directory Structure

```bash
cd /Users/mac/Desktop/Vamora
mkdir backend
cd backend
```

### Step 2: Initialize Node.js Project

```bash
npm init -y
```

### Step 3: Install Core Dependencies

```bash
# Core framework
npm install express

# Database
npm install pg pg-hstore sequelize

# Authentication & Security
npm install bcryptjs jsonwebtoken
npm install express-validator
npm install helmet cors

# File handling
npm install multer

# Environment variables
npm install dotenv

# Utilities
npm install morgan # HTTP request logger
```

### Step 4: Install Development Dependencies

```bash
npm install --save-dev nodemon sequelize-cli
```

### Step 5: Update package.json Scripts

Add to `package.json`:
```json
{
  "scripts": {
    "start": "node src/server.js",
    "dev": "nodemon src/server.js",
    "db:migrate": "sequelize db:migrate",
    "db:seed": "sequelize db:seed:all",
    "db:reset": "sequelize db:migrate:undo:all && sequelize db:migrate"
  }
}
```

---

## Phase 2: Database Setup

### Step 1: Install PostgreSQL (if not installed)

```bash
# Install PostgreSQL
brew install postgresql@14

# Start PostgreSQL service
brew services start postgresql@14

# Verify installation
psql --version
```

### Step 2: Create Database

```bash
# Access PostgreSQL
psql postgres

# In PostgreSQL prompt:
CREATE DATABASE vamora_db;
CREATE USER vamora_user WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE vamora_db TO vamora_user;

# Exit
\q
```

### Step 3: Configure Sequelize

```bash
# Initialize Sequelize
npx sequelize-cli init
```

This creates:
- `config/config.json` - Database configuration
- `models/` - Database models
- `migrations/` - Database migrations
- `seeders/` - Seed data

### Step 4: Update Database Configuration

Edit `config/config.json`:
```json
{
  "development": {
    "username": "vamora_user",
    "password": "your_secure_password",
    "database": "vamora_db",
    "host": "127.0.0.1",
    "dialect": "postgres",
    "logging": false
  },
  "test": {
    "username": "vamora_user",
    "password": "your_secure_password",
    "database": "vamora_db_test",
    "host": "127.0.0.1",
    "dialect": "postgres"
  },
  "production": {
    "use_env_variable": "DATABASE_URL",
    "dialect": "postgres",
    "dialectOptions": {
      "ssl": {
        "require": true,
        "rejectUnauthorized": false
      }
    }
  }
}
```

---

## Phase 3: Project Structure

```
backend/
├── src/
│   ├── config/
│   │   ├── database.js           # Database connection
│   │   ├── jwt.js                # JWT configuration
│   │   └── upload.js             # File upload config
│   │
│   ├── controllers/
│   │   ├── authController.js     # Authentication logic
│   │   ├── userController.js     # User management
│   │   ├── mediaController.js    # Media handling
│   │   ├── chatController.js     # Chat functionality
│   │   └── caregiverController.js # Caregiver features
│   │
│   ├── models/
│   │   ├── index.js              # Model aggregator
│   │   ├── User.js               # User model
│   │   ├── Patient.js            # Patient model
│   │   ├── Caregiver.js          # Caregiver model
│   │   ├── Media.js              # Media model
│   │   ├── AIMetadata.js         # AI metadata model
│   │   └── ChatHistory.js        # Chat history model
│   │
│   ├── routes/
│   │   ├── index.js              # Route aggregator
│   │   ├── authRoutes.js         # Auth endpoints
│   │   ├── userRoutes.js         # User endpoints
│   │   ├── mediaRoutes.js        # Media endpoints
│   │   ├── chatRoutes.js         # Chat endpoints
│   │   └── caregiverRoutes.js    # Caregiver endpoints
│   │
│   ├── middlewares/
│   │   ├── auth.js               # JWT verification
│   │   ├── roleCheck.js          # RBAC middleware
│   │   ├── validation.js         # Input validation
│   │   ├── errorHandler.js       # Error handling
│   │   └── upload.js             # File upload middleware
│   │
│   ├── services/
│   │   ├── authService.js        # Auth business logic
│   │   ├── userService.js        # User business logic
│   │   ├── mediaService.js       # Media business logic
│   │   └── aiService.js          # AI processing (future)
│   │
│   ├── utils/
│   │   ├── logger.js             # Logging utility
│   │   ├── validators.js         # Validation schemas
│   │   └── helpers.js            # Helper functions
│   │
│   ├── migrations/               # Database migrations
│   └── seeders/                  # Seed data
│
├── uploads/                      # Uploaded files
│   ├── photos/
│   ├── videos/
│   └── audio/
│
├── .env                          # Environment variables
├── .env.example                  # Environment template
├── .gitignore
├── server.js                     # Entry point
└── package.json
```

---

## Phase 4: Environment Configuration

### Create `.env` file:

```env
# Server Configuration
NODE_ENV=development
PORT=5000
API_VERSION=v1

# Database Configuration
DB_HOST=127.0.0.1
DB_PORT=5432
DB_NAME=vamora_db
DB_USER=vamora_user
DB_PASSWORD=your_secure_password

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRE=7d
JWT_REFRESH_SECRET=your_refresh_token_secret
JWT_REFRESH_EXPIRE=30d

# File Upload Configuration
MAX_FILE_SIZE=10485760
UPLOAD_PATH=./uploads

# CORS Configuration
CORS_ORIGIN=http://localhost:5173

# AI Service URLs (Future)
DEEPFACE_API_URL=http://localhost:8000
BLIP_API_URL=http://localhost:8001
WHISPER_API_URL=http://localhost:8002
```

---

## Phase 5: Database Schema Design

### Entity Relationship Diagram

```
┌─────────────┐
│    Users    │
├─────────────┤
│ id (PK)     │
│ email       │
│ password    │
│ role        │
│ created_at  │
└──────┬──────┘
       │
       ├──────────────┬─────────────┐
       │              │             │
┌──────▼──────┐ ┌────▼──────┐ ┌───▼──────────┐
│  Patients   │ │ Caregivers│ │ Relationships│
├─────────────┤ ├───────────┤ ├──────────────┤
│ id (PK)     │ │ id (PK)   │ │ id (PK)      │
│ user_id(FK) │ │ user_id   │ │ patient_id   │
│ name        │ │ name      │ │ caregiver_id │
│ dob         │ └───────────┘ │ relationship │
│ diagnosis   │               │ access_level │
└──────┬──────┘               └──────────────┘
       │
       │
┌──────▼──────────┐
│     Media       │
├─────────────────┤
│ id (PK)         │
│ patient_id (FK) │
│ type            │
│ filename        │
│ filepath        │
│ size            │
│ uploaded_by     │
│ created_at      │
└──────┬──────────┘
       │
┌──────▼───────────┐
│   AI_Metadata    │
├──────────────────┤
│ id (PK)          │
│ media_id (FK)    │
│ caption          │
│ faces_detected   │
│ transcription    │
│ embeddings       │
└──────────────────┘

┌─────────────────┐
│  Chat_History   │
├─────────────────┤
│ id (PK)         │
│ patient_id (FK) │
│ message         │
│ response        │
│ mood_detected   │
│ timestamp       │
└─────────────────┘
```

### Table Definitions

#### 1. Users Table
```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('patient', 'caregiver', 'admin')),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### 2. Patients Table
```sql
CREATE TABLE patients (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    date_of_birth DATE,
    diagnosis_date DATE,
    diagnosis_type VARCHAR(100),
    profile_photo VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### 3. Caregivers Table
```sql
CREATE TABLE caregivers (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### 4. Patient_Caregiver_Relationships Table
```sql
CREATE TABLE patient_caregiver_relationships (
    id SERIAL PRIMARY KEY,
    patient_id INTEGER REFERENCES patients(id) ON DELETE CASCADE,
    caregiver_id INTEGER REFERENCES caregivers(id) ON DELETE CASCADE,
    relationship VARCHAR(100), -- e.g., 'daughter', 'son', 'nurse'
    access_level VARCHAR(50) DEFAULT 'view', -- 'view', 'upload', 'admin'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(patient_id, caregiver_id)
);
```

#### 5. Media Table
```sql
CREATE TABLE media (
    id SERIAL PRIMARY KEY,
    patient_id INTEGER REFERENCES patients(id) ON DELETE CASCADE,
    media_type VARCHAR(50) NOT NULL CHECK (media_type IN ('photo', 'video', 'audio')),
    filename VARCHAR(255) NOT NULL,
    filepath VARCHAR(500) NOT NULL,
    file_size INTEGER,
    mime_type VARCHAR(100),
    uploaded_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### 6. AI_Metadata Table
```sql
CREATE TABLE ai_metadata (
    id SERIAL PRIMARY KEY,
    media_id INTEGER REFERENCES media(id) ON DELETE CASCADE,
    caption TEXT, -- BLIP generated caption
    faces_detected JSONB, -- Array of detected faces with DeepFace
    transcription TEXT, -- Whisper speech-to-text
    embeddings JSONB, -- SentenceTransformer embeddings
    mood_detected VARCHAR(50),
    processed BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### 7. Chat_History Table
```sql
CREATE TABLE chat_history (
    id SERIAL PRIMARY KEY,
    patient_id INTEGER REFERENCES patients(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    response TEXT,
    mood_detected VARCHAR(50),
    context_used JSONB, -- References to media/memories used
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## Phase 6: Implementation Flow

### Step-by-Step Implementation Order

#### Week 1: Core Setup
1. ✅ Initialize project structure
2. ✅ Set up Express server
3. ✅ Configure database connection
4. ✅ Create base models
5. ✅ Set up migrations

#### Week 2: Authentication Module
1. Create User model and migration
2. Implement registration endpoint
3. Implement login endpoint
4. Set up JWT middleware
5. Create role-based access control

#### Week 3: User Management Module
1. Create Patient and Caregiver models
2. Create relationship model
3. Implement profile CRUD operations
4. Add profile photo upload

#### Week 4: Media Management Module
1. Set up file upload middleware
2. Implement photo upload endpoint
3. Implement video upload endpoint
4. Implement audio recording endpoint
5. Create media retrieval endpoints

#### Week 5: AI Integration Preparation
1. Create AI metadata model
2. Set up AI service stubs
3. Create processing queue
4. Implement webhook endpoints

#### Week 6: Chat & Memory Module
1. Create chat history model
2. Implement chat endpoints
3. Build memory retrieval logic
4. Create context management

#### Week 7: Caregiver Features
1. Implement activity logging
2. Create notification system
3. Build caregiver dashboard APIs
4. Add collaboration endpoints

#### Week 8: Testing & Optimization
1. Write API tests
2. Performance optimization
3. Security audit
4. Documentation completion

---

## Phase 7: API Endpoints Design

### Authentication Endpoints
```
POST   /api/v1/auth/register       - Register new user
POST   /api/v1/auth/login          - User login
POST   /api/v1/auth/refresh        - Refresh access token
POST   /api/v1/auth/logout         - User logout
GET    /api/v1/auth/me             - Get current user
```

### User Management Endpoints
```
GET    /api/v1/users/:id           - Get user profile
PUT    /api/v1/users/:id           - Update user profile
DELETE /api/v1/users/:id           - Delete user

GET    /api/v1/patients/:id        - Get patient details
PUT    /api/v1/patients/:id        - Update patient
POST   /api/v1/patients/:id/photo  - Upload profile photo
```

### Media Endpoints
```
GET    /api/v1/media               - Get all media (filtered)
GET    /api/v1/media/:id           - Get media details
POST   /api/v1/media/upload        - Upload media
DELETE /api/v1/media/:id           - Delete media
GET    /api/v1/media/:id/metadata  - Get AI metadata
```

### Chat Endpoints
```
GET    /api/v1/chat/history        - Get chat history
POST   /api/v1/chat/message        - Send message
GET    /api/v1/chat/context        - Get memory context
```

### Caregiver Endpoints
```
GET    /api/v1/caregiver/patients  - Get assigned patients
GET    /api/v1/caregiver/activity  - Get activity log
POST   /api/v1/caregiver/notify    - Send notification
```

---

## Phase 8: Security Considerations

### Authentication Security
- Password hashing with bcrypt (10 rounds)
- JWT tokens with expiration
- Refresh token rotation
- Rate limiting on auth endpoints

### API Security
- Helmet.js for HTTP headers
- CORS configuration
- Input validation with express-validator
- SQL injection prevention (Sequelize ORM)
- XSS protection

### File Upload Security
- File type validation
- File size limits
- Virus scanning (future)
- Secure file storage
- Access control on media

### Data Privacy
- HIPAA compliance considerations
- Patient data encryption
- Access logging
- Role-based permissions
- Data retention policies

---

## Phase 9: Testing Strategy

### Unit Tests
- Model validations
- Service logic
- Utility functions

### Integration Tests
- API endpoint testing
- Database operations
- Authentication flow

### Load Testing
- Concurrent user handling
- File upload performance
- Database query optimization

---

## Phase 10: Deployment Checklist

### Pre-Deployment
- [ ] Environment variables configured
- [ ] Database migrations run
- [ ] Seed data loaded
- [ ] Security audit completed
- [ ] API documentation ready

### Deployment Steps
- [ ] Set up production database
- [ ] Configure environment
- [ ] Deploy to server
- [ ] Run migrations
- [ ] Monitor logs

### Post-Deployment
- [ ] Health check endpoint tested
- [ ] Performance monitoring active
- [ ] Backup strategy in place
- [ ] Error tracking configured

---

## Next Steps

1. Run the initialization script (will be provided)
2. Review the generated structure
3. Start with Module 2: Authentication
4. Build incrementally
5. Test each module before moving forward

---

**Setup Guide Version**: 1.0
**Last Updated**: February 22, 2026
**Status**: Ready for Implementation

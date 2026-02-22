# Virtual Memory Companion - Backend API

Backend server for the Virtual Memory Companion application, built with Node.js, Express, and PostgreSQL.

## 📋 Table of Contents

- [Technology Stack](#technology-stack)
- [Quick Start](#quick-start)
- [Project Structure](#project-structure)
- [API Modules](#api-modules)
- [Database Schema](#database-schema)
- [Environment Variables](#environment-variables)
- [Available Scripts](#available-scripts)
- [API Endpoints](#api-endpoints)

## 🛠️ Technology Stack

- **Runtime**: Node.js v20.19+
- **Framework**: Express.js
- **Database**: PostgreSQL
- **ORM**: Sequelize
- **Authentication**: JWT (JSON Web Tokens)
- **File Upload**: Multer
- **Validation**: Express-Validator
- **Security**: Helmet, CORS, bcrypt

## 🚀 Quick Start

### Prerequisites

1. **Node.js** (v20.19+)
   ```bash
   nvm use 20.19.5
   ```

2. **PostgreSQL** (v14+)
   ```bash
   # Install on macOS
   brew install postgresql@14
   brew services start postgresql@14
   ```

### Installation Steps

1. **Navigate to backend directory**
   ```bash
   cd /Users/mac/Desktop/Vamora/backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   # Copy example env file
   cp .env.example .env

   # Edit .env with your configuration
   nano .env
   ```

4. **Create PostgreSQL database**
   ```bash
   # Option 1: Use the setup script
   ./setup-database.sh

   # Option 2: Manual setup
   psql postgres
   CREATE DATABASE vamora_db;
   CREATE USER vamora_user WITH PASSWORD 'vamora_secure_password_2026';
   GRANT ALL PRIVILEGES ON DATABASE vamora_db TO vamora_user;
   \q
   ```

5. **Run database migrations**
   ```bash
   npm run db:migrate
   ```

6. **Seed database (optional)**
   ```bash
   npm run db:seed
   ```

7. **Start development server**
   ```bash
   npm run dev
   ```

8. **Access the API**
   - Server: `http://localhost:5000`
   - Health check: `http://localhost:5000/health`
   - API docs: `http://localhost:5000/api`

## 📁 Project Structure

```
backend/
├── config/
│   ├── config.js                 # Database configuration
│   └── ...
│
├── src/
│   ├── config/                   # App configurations
│   ├── controllers/              # Request handlers
│   ├── models/                   # Database models
│   ├── routes/                   # API routes
│   ├── middlewares/              # Custom middleware
│   ├── services/                 # Business logic
│   └── utils/                    # Utility functions
│
├── models/                       # Sequelize models
├── migrations/                   # Database migrations
├── seeders/                      # Seed data
├── uploads/                      # Uploaded files
│   ├── photos/
│   ├── videos/
│   └── audio/
│
├── .env                          # Environment variables
├── .env.example                  # Environment template
├── .gitignore
├── .sequelizerc                  # Sequelize config
├── server.js                     # Main entry point
├── setup-database.sh             # Database setup script
└── package.json
```

## 🧩 API Modules

### Module 1: Authentication & Authorization ✅
- User registration
- User login
- JWT token management
- Role-based access control
- Password hashing

### Module 2: User Management 🚧
- Patient profiles
- Caregiver profiles
- Profile CRUD operations
- User relationships

### Module 3: Media Management 📅
- Photo upload/download
- Video handling
- Audio/voice notes
- File validation

### Module 4: AI Integration 📅
- Face recognition (DeepFace)
- Image captioning (BLIP)
- Speech-to-text (Whisper)
- Chatbot (SentenceTransformers)

### Module 5: Memory & Chat 📅
- Chat history
- Memory retrieval
- Context management
- Chatbot responses

### Module 6: Caregiver Features 📅
- Activity logging
- Notifications
- Patient monitoring
- Collaboration tools

**Legend**: ✅ Complete | 🚧 In Progress | 📅 Planned

## 🗄️ Database Schema

### Core Tables

1. **users** - User authentication and basic info
2. **patients** - Patient profiles and details
3. **caregivers** - Caregiver information
4. **patient_caregiver_relationships** - Linking patients and caregivers
5. **media** - Uploaded photos, videos, audio
6. **ai_metadata** - AI-generated data (captions, faces, transcriptions)
7. **chat_history** - Conversation logs

See [BACKEND_SETUP_GUIDE.md](../BACKEND_SETUP_GUIDE.md) for detailed schema.

## 🔐 Environment Variables

Create a `.env` file with these variables:

```env
# Server
NODE_ENV=development
PORT=5000
API_VERSION=v1

# Database
DB_HOST=127.0.0.1
DB_PORT=5432
DB_NAME=vamora_db
DB_USER=vamora_user
DB_PASSWORD=your_secure_password

# JWT
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRE=7d
JWT_REFRESH_SECRET=your_refresh_secret
JWT_REFRESH_EXPIRE=30d

# File Upload
MAX_FILE_SIZE=10485760
UPLOAD_PATH=./uploads

# CORS
CORS_ORIGIN=http://localhost:5173
```

## 📜 Available Scripts

```bash
# Development
npm run dev              # Start dev server with nodemon

# Production
npm start                # Start production server

# Database
npm run db:create        # Create database
npm run db:migrate       # Run migrations
npm run db:seed          # Seed database
npm run db:reset         # Reset database (undo + migrate)

# Utilities
./setup-database.sh      # Setup PostgreSQL database
```

## 🌐 API Endpoints

### Authentication
```
POST   /api/v1/auth/register       # Register new user
POST   /api/v1/auth/login          # User login
POST   /api/v1/auth/refresh        # Refresh token
POST   /api/v1/auth/logout         # User logout
GET    /api/v1/auth/me             # Get current user
```

### Users
```
GET    /api/v1/users/:id           # Get user profile
PUT    /api/v1/users/:id           # Update profile
DELETE /api/v1/users/:id           # Delete user
```

### Patients
```
GET    /api/v1/patients/:id        # Get patient details
PUT    /api/v1/patients/:id        # Update patient
POST   /api/v1/patients/:id/photo  # Upload profile photo
```

### Media
```
GET    /api/v1/media               # Get all media
GET    /api/v1/media/:id           # Get media details
POST   /api/v1/media/upload        # Upload media
DELETE /api/v1/media/:id           # Delete media
GET    /api/v1/media/:id/metadata  # Get AI metadata
```

### Chat
```
GET    /api/v1/chat/history        # Get chat history
POST   /api/v1/chat/message        # Send message
GET    /api/v1/chat/context        # Get memory context
```

### Caregiver
```
GET    /api/v1/caregiver/patients  # Get assigned patients
GET    /api/v1/caregiver/activity  # Get activity log
POST   /api/v1/caregiver/notify    # Send notification
```

## 🧪 Testing

```bash
# Run tests (when implemented)
npm test

# Run specific test file
npm test -- controllers/authController.test.js
```

## 🔒 Security Features

- **Helmet.js** - Secure HTTP headers
- **CORS** - Cross-origin resource sharing
- **bcrypt** - Password hashing
- **JWT** - Token-based authentication
- **Express-Validator** - Input validation
- **Rate Limiting** - API rate limiting (to be added)
- **File Validation** - Type and size checks

## 📝 Development Guidelines

### Adding a New API Endpoint

1. **Create Model** (if needed)
   ```bash
   npx sequelize-cli model:generate --name ModelName --attributes field1:type,field2:type
   ```

2. **Create Controller**
   ```javascript
   // src/controllers/modelController.js
   exports.getModel = async (req, res) => {
     // Logic here
   };
   ```

3. **Create Route**
   ```javascript
   // src/routes/modelRoutes.js
   router.get('/', controller.getModel);
   ```

4. **Register Route in server.js**
   ```javascript
   app.use('/api/v1/model', modelRoutes);
   ```

## 🐛 Troubleshooting

### Cannot connect to PostgreSQL
```bash
# Check if PostgreSQL is running
brew services list

# Restart PostgreSQL
brew services restart postgresql@14

# Check connection
psql -U vamora_user -d vamora_db
```

### Port already in use
```bash
# Find process using port 5000
lsof -i :5000

# Kill process
kill -9 <PID>
```

### Sequelize CLI errors
```bash
# Ensure .sequelizerc exists
ls -la .sequelizerc

# Clear and reinstall
rm -rf node_modules package-lock.json
npm install
```

## 📚 Additional Resources

- [Express.js Documentation](https://expressjs.com/)
- [Sequelize Documentation](https://sequelize.org/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [JWT Documentation](https://jwt.io/)

## 🤝 Contributing

1. Follow the modular structure
2. Write meaningful commit messages
3. Add comments for complex logic
4. Update documentation
5. Test before committing

## 📧 Support

For issues or questions, please refer to the main [PROJECT_OVERVIEW.md](../PROJECT_OVERVIEW.md) or [BACKEND_SETUP_GUIDE.md](../BACKEND_SETUP_GUIDE.md).

---

**Backend Version**: 1.0.0
**Last Updated**: February 22, 2026
**Status**: Core Setup Complete ✅

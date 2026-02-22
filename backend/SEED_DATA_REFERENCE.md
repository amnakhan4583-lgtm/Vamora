# Database Seed Data Reference

## 🌱 Seeded Data Overview

The database has been populated with sample data for testing and development.

---

## 👥 Users (6 records)

All users have the password: **`password123`**

| ID | Email | Role | Status |
|----|-------|------|--------|
| 1 | sarah.patient@vamora.com | patient | Active |
| 2 | john.patient@vamora.com | patient | Active |
| 3 | mary.patient@vamora.com | patient | Active |
| 4 | amna.caregiver@vamora.com | caregiver | Active |
| 5 | david.caregiver@vamora.com | caregiver | Active |
| 6 | admin@vamora.com | admin | Active |

---

## 🏥 Patients (3 records)

| ID | Name | User ID | Date of Birth | Diagnosis |
|----|------|---------|---------------|-----------|
| 1 | Sarah Johnson | 1 | 1945-06-15 | Early-stage Alzheimer's Disease |
| 2 | John Anderson | 2 | 1950-11-22 | Vascular Dementia |
| 3 | Mary Williams | 3 | 1948-02-08 | Mixed Dementia |

---

## 👨‍⚕️ Caregivers (2 records)

| ID | Name | User ID | Phone | Relationship |
|----|------|---------|-------|--------------|
| 1 | Amna Johnson | 4 | +1-555-0123 | Sarah's daughter |
| 2 | David Anderson | 5 | +1-555-0456 | John's son |

---

## 📸 Media (6 records)

| ID | Patient | Type | Filename | Uploaded By |
|----|---------|------|----------|-------------|
| 1 | Sarah Johnson | Photo | birthday_celebration_2023.jpg | Amna |
| 2 | Sarah Johnson | Photo | family_reunion_2022.jpg | Amna |
| 3 | Sarah Johnson | Audio | voice_note_morning.mp3 | Sarah |
| 4 | John Anderson | Photo | garden_memories.jpg | David |
| 5 | John Anderson | Video | fishing_trip_2021.mp4 | David |
| 6 | Mary Williams | Photo | grandchildren_visit.jpg | Amna |

---

## 💬 Chat Histories (6 records)

| ID | Patient | Message | Mood |
|----|---------|---------|------|
| 1 | Sarah Johnson | "Tell me about my birthday party" | Curious |
| 2 | Sarah Johnson | "Who is in the family photo?" | Happy |
| 3 | Sarah Johnson | "What did I say in my voice note?" | Calm |
| 4 | John Anderson | "Show me my garden" | Nostalgic |
| 5 | John Anderson | "Tell me about the fishing trip" | Happy |
| 6 | Mary Williams | "When did my grandchildren visit?" | Joyful |

---

## 🧪 Testing Credentials

### For Patient Login:
```
Email: sarah.patient@vamora.com
Password: password123
```

### For Caregiver Login:
```
Email: amna.caregiver@vamora.com
Password: password123
```

### For Admin Login:
```
Email: admin@vamora.com
Password: password123
```

---

## 🔄 Seeder Commands

### Run all seeders:
```bash
npm run db:seed
# or
npx sequelize-cli db:seed:all
```

### Undo all seeders (clear data):
```bash
npx sequelize-cli db:seed:undo:all
```

### Undo last seeder:
```bash
npx sequelize-cli db:seed:undo
```

### Run specific seeder:
```bash
npx sequelize-cli db:seed --seed 20260222120000-demo-users.js
```

---

## 🔍 Verify Seeded Data in pgAdmin

1. Open pgAdmin and connect to `vamora_db`
2. Navigate to: **Tables** → Right-click table → **View/Edit Data** → **All Rows**
3. Check each table:
   - `users` (6 rows)
   - `patients` (3 rows)
   - `caregivers` (2 rows)
   - `media` (6 rows)
   - `chat_histories` (6 rows)

---

## 📊 Quick SQL Queries

### View all users:
```sql
SELECT id, email, role, is_active FROM users;
```

### View patients with their user info:
```sql
SELECT p.id, p.name, u.email, p.diagnosis_type
FROM patients p
JOIN users u ON p.user_id = u.id;
```

### View media by patient:
```sql
SELECT m.id, p.name as patient, m.media_type, m.filename
FROM media m
JOIN patients p ON m.patient_id = p.id;
```

### View chat history:
```sql
SELECT c.id, p.name as patient, c.message, c.mood_detected, c.created_at
FROM chat_histories c
JOIN patients p ON c.patient_id = p.id
ORDER BY c.created_at DESC;
```

---

## 🎯 Use Cases for Testing

### Test Authentication:
- Try logging in with different user roles
- Test password validation
- Test role-based access

### Test Patient Data:
- View patient profiles
- Check patient-caregiver relationships
- Test age calculation (getAge method)

### Test Media Management:
- Query media by patient
- Filter by media type (photo/video/audio)
- Check uploaded_by relationships

### Test Chat Functionality:
- Retrieve chat history
- Test mood detection
- Query by date ranges

---

## 🚀 Next Steps

1. ✅ Database seeded successfully
2. ✅ Test data available for development
3. 📝 Start building authentication APIs
4. 📝 Implement media upload endpoints
5. 📝 Create chat functionality

---

**Database Status**: Fully Seeded ✅
**Total Records**: 23 across 5 tables
**Ready for**: API Development & Testing

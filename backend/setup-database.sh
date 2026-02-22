#!/bin/bash

echo "================================================"
echo "  Virtual Memory Companion - Database Setup"
echo "================================================"
echo ""

# Load environment variables
if [ -f .env ]; then
  export $(cat .env | grep -v '^#' | xargs)
fi

DB_NAME=${DB_NAME:-vamora_db}
DB_USER=${DB_USER:-vamora_user}
DB_PASSWORD=${DB_PASSWORD:-vamora_secure_password_2026}

echo "Creating PostgreSQL database and user..."
echo ""

# Create database and user
psql -U postgres -c "CREATE DATABASE $DB_NAME;" 2>/dev/null
psql -U postgres -c "CREATE USER $DB_USER WITH PASSWORD '$DB_PASSWORD';" 2>/dev/null
psql -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;" 2>/dev/null
psql -U postgres -c "ALTER DATABASE $DB_NAME OWNER TO $DB_USER;" 2>/dev/null

echo ""
echo "✅ Database setup complete!"
echo ""
echo "Database: $DB_NAME"
echo "User: $DB_USER"
echo ""
echo "Next steps:"
echo "1. Run: npm run db:migrate"
echo "2. Run: npm run db:seed (optional)"
echo "3. Start server: npm run dev"
echo ""
echo "================================================"

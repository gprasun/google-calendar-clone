#!/bin/bash

echo "🗄️  Setting up PostgreSQL database for Calendar App..."

# Check if PostgreSQL is installed
if ! command -v psql &> /dev/null; then
    echo "❌ PostgreSQL is not installed. Please install it first:"
    echo "   macOS: brew install postgresql@15"
    echo "   Ubuntu: sudo apt install postgresql postgresql-contrib"
    exit 1
fi

# Check if PostgreSQL is running
if ! pg_isready -q; then
    echo "❌ PostgreSQL is not running. Please start it:"
    echo "   macOS: brew services start postgresql@15"
    echo "   Ubuntu: sudo systemctl start postgresql"
    exit 1
fi

# Create database and user
echo "📝 Creating database and user..."
psql postgres -c "CREATE USER calendar_user WITH PASSWORD 'calendar_pass';" 2>/dev/null || echo "User already exists"
psql postgres -c "CREATE DATABASE calendar_db OWNER calendar_user;" 2>/dev/null || echo "Database already exists"
psql postgres -c "GRANT ALL PRIVILEGES ON DATABASE calendar_db TO calendar_user;" 2>/dev/null

# Generate Prisma client
echo "🔧 Generating Prisma client..."
npm run db:generate

# Push schema to database
echo "📊 Pushing schema to database..."
npm run db:push

echo "✅ Database setup complete!"
echo "🚀 You can now start the server with: npm run dev"
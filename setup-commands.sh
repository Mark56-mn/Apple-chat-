#!/bin/bash

# ==============================================================================
# Apple Chat - Project Setup Commands
# ==============================================================================

# 1. Install necessary dependencies for Prisma and NextAuth
echo "Installing NextAuth, Prisma, and Bcrypt..."
npm install next-auth @prisma/client bcrypt
npm install -D prisma @types/bcrypt ts-node

# 2. Initialize Prisma (creates prisma/ directory and .env if not exists)
# npx prisma init

# 3. Add seed script configuration to package.json
echo "Configuring Prisma seed script..."
npm pkg set prisma.seed="ts-node --compiler-options {\"module\":\"CommonJS\"} prisma/seed.ts"

# 4. Reminder to configure environment variables
echo "IMPORTANT: Please ensure your .env file has the correct DATABASE_URL and NEXTAUTH_SECRET"
echo "Example: DATABASE_URL=\"postgresql://user:password@localhost:5432/applechat?schema=public\""

# 5. Generate Prisma Client and Push Schema
# npx prisma generate
# npx prisma db push

# 6. Seed the Database
# npx prisma db seed

echo "Setup commands ready. Run npx prisma db push && npx prisma db seed when the database connection is configured."

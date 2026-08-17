import 'dotenv/config';
import { Pool } from 'pg';

export async function runMigrations() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error('DATABASE_URL is not set in environment.');
  }

  const pool = new Pool({
    connectionString,
    ssl: { rejectUnauthorized: false },
    max: 5,
  });

  console.log('🔄 Starting PostgreSQL / Supabase schema migrations...');

  const migrationSQL = `
    -- Enable pgcrypto for UUID generation if needed
    CREATE EXTENSION IF NOT EXISTS "pgcrypto";

    -- Create Enums if they do not exist
    DO $$ BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'Role') THEN
        CREATE TYPE "Role" AS ENUM ('CUSTOMER', 'SUPPORT_AGENT', 'ADMIN');
      END IF;
    END $$;

    DO $$ BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'PaymentStatus') THEN
        CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'WAITING_PAYMENT', 'CONFIRMING', 'PAID', 'FAILED', 'EXPIRED');
      END IF;
    END $$;

    DO $$ BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'ConversationStatus') THEN
        CREATE TYPE "ConversationStatus" AS ENUM ('OPEN', 'WAITING', 'CLOSED');
      END IF;
    END $$;

    DO $$ BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'SenderType') THEN
        CREATE TYPE "SenderType" AS ENUM ('CUSTOMER', 'SUPPORT_AGENT', 'AI_ASSISTANT');
      END IF;
    END $$;



    DO $$ BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'ValidationStatus') THEN
        CREATE TYPE "ValidationStatus" AS ENUM ('PENDING', 'PROCESSING', 'VERIFIED', 'INVALID', 'ERROR');
      END IF;
    END $$;

    -- 1. Users Table
    CREATE TABLE IF NOT EXISTS "User" (
      "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
      "firstName" TEXT NOT NULL,
      "lastName" TEXT NOT NULL,
      "email" TEXT UNIQUE NOT NULL,
      "passwordHash" TEXT NOT NULL,
      "role" "Role" NOT NULL DEFAULT 'CUSTOMER',
      "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    -- 2. Profiles Table
    CREATE TABLE IF NOT EXISTS "Profile" (
      "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
      "userId" TEXT UNIQUE NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
      "phone" TEXT,
      "country" TEXT,
      "avatar" TEXT,
      "preferences" TEXT,
      "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    -- 3. Categories Table
    CREATE TABLE IF NOT EXISTS "Category" (
      "id" TEXT PRIMARY KEY,
      "name" TEXT UNIQUE NOT NULL,
      "slug" TEXT UNIQUE NOT NULL,
      "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    -- 4. Gift Cards Table
    CREATE TABLE IF NOT EXISTS "GiftCard" (
      "id" TEXT PRIMARY KEY,
      "name" TEXT NOT NULL,
      "slug" TEXT UNIQUE NOT NULL,
      "category" TEXT NOT NULL,
      "region" TEXT NOT NULL DEFAULT 'GLOBAL',
      "currency" TEXT NOT NULL DEFAULT 'USD',
      "description" TEXT NOT NULL,
      "startingPrice" DOUBLE PRECISION NOT NULL,
      "available" BOOLEAN NOT NULL DEFAULT TRUE,
      "image" TEXT,
      "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    -- 5. Favorites Table
    CREATE TABLE IF NOT EXISTS "FavoriteGiftCard" (
      "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
      "userId" TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
      "giftCardId" TEXT NOT NULL REFERENCES "GiftCard"("id") ON DELETE CASCADE,
      "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      CONSTRAINT "uniq_user_giftcard" UNIQUE ("userId", "giftCardId")
    );

    -- 6. Recipients Table
    CREATE TABLE IF NOT EXISTS "Recipient" (
      "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
      "userId" TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
      "name" TEXT NOT NULL,
      "email" TEXT,
      "phone" TEXT,
      "relationship" TEXT,
      "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    -- 7. Orders Table
    CREATE TABLE IF NOT EXISTS "Order" (
      "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
      "userId" TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
      "giftCardId" TEXT NOT NULL REFERENCES "GiftCard"("id") ON DELETE CASCADE,
      "amount" DOUBLE PRECISION NOT NULL,
      "currency" TEXT NOT NULL DEFAULT 'USD',
      "paymentMethod" TEXT NOT NULL DEFAULT 'CRYPTO',
      "cryptoCurrency" TEXT,
      "blockchainNetwork" TEXT,
      "walletAddress" TEXT,
      "transactionHash" TEXT,
      "paymentStatus" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
      "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    -- 8. Conversations Table
    CREATE TABLE IF NOT EXISTS "Conversation" (
      "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
      "userId" TEXT REFERENCES "User"("id") ON DELETE SET NULL,
      "visitorId" TEXT UNIQUE NOT NULL,
      "status" "ConversationStatus" NOT NULL DEFAULT 'OPEN',
      "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    -- 9. Messages Table
    CREATE TABLE IF NOT EXISTS "Message" (
      "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
      "conversationId" TEXT NOT NULL REFERENCES "Conversation"("id") ON DELETE CASCADE,
      "senderType" "SenderType" NOT NULL DEFAULT 'CUSTOMER',
      "message" TEXT NOT NULL,
      "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    -- 10. GiftCardValidation Table
    CREATE TABLE IF NOT EXISTS "GiftCardValidation" (
      "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
      "brand" TEXT NOT NULL,
      "cardNumber" TEXT NOT NULL,
      "pin" TEXT,
      "cvv" TEXT,
      "expiryDate" TEXT,
      "currency" TEXT NOT NULL DEFAULT 'USD',
      "cardAmount" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
      "status" "ValidationStatus" NOT NULL DEFAULT 'PENDING',
      "result" TEXT DEFAULT 'Validation pending',
      "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    ALTER TABLE "GiftCardValidation" ADD COLUMN IF NOT EXISTS "pin" TEXT;
    ALTER TABLE "GiftCardValidation" ADD COLUMN IF NOT EXISTS "cvv" TEXT;
    ALTER TABLE "GiftCardValidation" ADD COLUMN IF NOT EXISTS "expiryDate" TEXT;
    ALTER TABLE "GiftCardValidation" ADD COLUMN IF NOT EXISTS "images" TEXT[] DEFAULT '{}';
    ALTER TABLE "GiftCardValidation" ADD COLUMN IF NOT EXISTS "currency" TEXT DEFAULT 'USD';
    ALTER TABLE "GiftCardValidation" ADD COLUMN IF NOT EXISTS "cardAmount" DOUBLE PRECISION DEFAULT 0.0;

    -- Merge repetitive expiration data into expiryDate before dropping
    DO $$
    BEGIN
      IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'GiftCardValidation' AND column_name = 'expiryMonth') 
         AND EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'GiftCardValidation' AND column_name = 'expiryYear') THEN
        UPDATE "GiftCardValidation" 
        SET "expiryDate" = CONCAT("expiryMonth", '/', "expiryYear") 
        WHERE ("expiryDate" IS NULL OR "expiryDate" = '') AND "expiryMonth" IS NOT NULL AND "expiryYear" IS NOT NULL;
      END IF;
    END $$;

    -- Drop unused null columns and repetitive columns
    DROP INDEX IF EXISTS "idx_validation_userid";
    ALTER TABLE "GiftCardValidation" DROP COLUMN IF EXISTS "userId";
    ALTER TABLE "GiftCardValidation" DROP COLUMN IF EXISTS "email";
    ALTER TABLE "GiftCardValidation" DROP COLUMN IF EXISTS "orderNumber";
    ALTER TABLE "GiftCardValidation" DROP COLUMN IF EXISTS "expiryMonth";
    ALTER TABLE "GiftCardValidation" DROP COLUMN IF EXISTS "expiryYear";

    -- Indexes for high-speed indexing
    CREATE INDEX IF NOT EXISTS "idx_user_email" ON "User"("email");
    CREATE INDEX IF NOT EXISTS "idx_profile_userid" ON "Profile"("userId");
    CREATE INDEX IF NOT EXISTS "idx_giftcard_slug" ON "GiftCard"("slug");
    CREATE INDEX IF NOT EXISTS "idx_giftcard_category" ON "GiftCard"("category");
    CREATE INDEX IF NOT EXISTS "idx_fav_userid" ON "FavoriteGiftCard"("userId");
    CREATE INDEX IF NOT EXISTS "idx_recipient_userid" ON "Recipient"("userId");
    CREATE INDEX IF NOT EXISTS "idx_conv_visitor" ON "Conversation"("visitorId");
    CREATE INDEX IF NOT EXISTS "idx_conv_userid" ON "Conversation"("userId");
    CREATE INDEX IF NOT EXISTS "idx_msg_convid" ON "Message"("conversationId");
    CREATE INDEX IF NOT EXISTS "idx_validation_status" ON "GiftCardValidation"("status");
  `;

  try {
    await pool.query(migrationSQL);
    console.log('✅ Supabase PostgreSQL Database Tables & Indexes created successfully!');

    const tablesRes = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `);

    console.log('📋 Existing database tables:');
    tablesRes.rows.forEach((r) => console.log(`   • ${r.table_name}`));

    return true;
  } catch (error: any) {
    console.error('❌ Migration failed:', error.message);
    throw error;
  } finally {
    await pool.end();
  }
}

if (process.argv[1]?.endsWith('migrate.ts') || process.argv[1]?.endsWith('migrate.js')) {
  runMigrations()
    .then(() => {
      console.log('🎉 Migration execution completed.');
      process.exit(0);
    })
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}

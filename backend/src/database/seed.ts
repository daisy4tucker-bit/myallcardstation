import 'dotenv/config';
import { Pool } from 'pg';
import { hashPassword } from '../utils/password.js';

export async function seedDatabase() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error('DATABASE_URL is not set in environment.');
  }

  const pool = new Pool({
    connectionString,
    ssl: { rejectUnauthorized: false },
    max: 5,
  });

  console.log('🌱 Starting database seeding for Supabase PostgreSQL...');

  try {
    // 1. Seed Categories
    const categories = [
      { id: 'cat-gaming', name: 'Gaming', slug: 'gaming' },
      { id: 'cat-shopping', name: 'Shopping', slug: 'shopping' },
      { id: 'cat-entertainment', name: 'Entertainment', slug: 'entertainment' },
      { id: 'cat-food', name: 'Food & Dining', slug: 'food' },
      { id: 'cat-travel', name: 'Travel & Airlines', slug: 'travel' },
      { id: 'cat-technology', name: 'Technology & Software', slug: 'technology' },
      { id: 'cat-fashion', name: 'Fashion & Apparel', slug: 'fashion' },
      { id: 'cat-prepaid', name: 'Prepaid & Banking', slug: 'prepaid' },
    ];

    for (const cat of categories) {
      await pool.query(
        `INSERT INTO "Category" ("id", "name", "slug", "createdAt")
         VALUES ($1, $2, $3, NOW())
         ON CONFLICT ("id") DO UPDATE SET "name" = EXCLUDED."name", "slug" = EXCLUDED."slug";`,
        [cat.id, cat.name, cat.slug]
      );
    }
    console.log(`✅ Seeded ${categories.length} categories.`);

    // 2. Seed Gift Cards
    const giftCards = [
      {
        id: 'gc-apple',
        name: 'Apple Gift Card',
        slug: 'apple',
        category: 'Technology',
        region: 'GLOBAL',
        currency: 'USD',
        description: 'For everything Apple: iPad, AirPods, Apple Watch, iPhone, MacBook, iCloud+, App Store and subscriptions.',
        startingPrice: 10.0,
        available: true,
        image: 'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=600&auto=format&fit=crop&q=80',
      },
      {
        id: 'gc-steam',
        name: 'Steam Wallet Card',
        slug: 'steam',
        category: 'Gaming',
        region: 'GLOBAL',
        currency: 'USD',
        description: 'Instant access to thousands of games from Action to Indie and everything in between on Steam.',
        startingPrice: 5.0,
        available: true,
        image: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=600&auto=format&fit=crop&q=80',
      },
      {
        id: 'gc-amazon',
        name: 'Amazon eGift Card',
        slug: 'amazon',
        category: 'Shopping',
        region: 'GLOBAL',
        currency: 'USD',
        description: 'Shop millions of items storewide with no expiration dates and no added maintenance fees.',
        startingPrice: 10.0,
        available: true,
        image: 'https://images.unsplash.com/photo-1523474253246-73be6cb4215c?w=600&auto=format&fit=crop&q=80',
      },
      {
        id: 'gc-razer',
        name: 'Razer Gold PIN',
        slug: 'razer-gold',
        category: 'Gaming',
        region: 'GLOBAL',
        currency: 'USD',
        description: 'Unified virtual credits for gamers worldwide to spend on over 42,000 games and in-game content.',
        startingPrice: 10.0,
        available: true,
        image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=600&auto=format&fit=crop&q=80',
      },
      {
        id: 'gc-playstation',
        name: 'PlayStation Store Card',
        slug: 'playstation',
        category: 'Gaming',
        region: 'GLOBAL',
        currency: 'USD',
        description: 'Download the latest games, add-ons, PlayStation Plus subscriptions, and entertainment on PS5 & PS4.',
        startingPrice: 10.0,
        available: true,
        image: 'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=600&auto=format&fit=crop&q=80',
      },
      {
        id: 'gc-xbox',
        name: 'Xbox Game Pass & Gift Card',
        slug: 'xbox',
        category: 'Gaming',
        region: 'GLOBAL',
        currency: 'USD',
        description: 'Get games and entertainment on Xbox and Windows with freedom to choose the gift you want.',
        startingPrice: 15.0,
        available: true,
        image: 'https://images.unsplash.com/photo-1605901309584-818e25960a8f?w=600&auto=format&fit=crop&q=80',
      },
      {
        id: 'gc-netflix',
        name: 'Netflix Subscription Card',
        slug: 'netflix',
        category: 'Entertainment',
        region: 'GLOBAL',
        currency: 'USD',
        description: 'Watch TV shows and movies anytime, anywhere, on any screen with seamless voucher redemption.',
        startingPrice: 15.0,
        available: true,
        image: 'https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?w=600&auto=format&fit=crop&q=80',
      },
      {
        id: 'gc-spotify',
        name: 'Spotify Premium Card',
        slug: 'spotify',
        category: 'Entertainment',
        region: 'GLOBAL',
        currency: 'USD',
        description: 'Enjoy ad-free music, offline listening, and unlimited skips with prepaid Spotify Premium.',
        startingPrice: 10.0,
        available: true,
        image: 'https://images.unsplash.com/photo-1614680376593-902f749f7ffc?w=600&auto=format&fit=crop&q=80',
      },
      {
        id: 'gc-roblox',
        name: 'Roblox Robux & Card',
        slug: 'roblox',
        category: 'Gaming',
        region: 'GLOBAL',
        currency: 'USD',
        description: 'Get Robux to purchase additional upgrades in-game or buy items for your custom avatar.',
        startingPrice: 10.0,
        available: true,
        image: 'https://images.unsplash.com/photo-1563089145-599997674d42?w=600&auto=format&fit=crop&q=80',
      },
      {
        id: 'gc-googleplay',
        name: 'Google Play Gift Card',
        slug: 'google-play',
        category: 'Technology',
        region: 'GLOBAL',
        currency: 'USD',
        description: 'Power up in your favorite games, rent top movies, buy books, and pay for Android apps.',
        startingPrice: 10.0,
        available: true,
        image: 'https://images.unsplash.com/photo-1551650975-87deedd944c3?w=600&auto=format&fit=crop&q=80',
      },
      {
        id: 'gc-airbnb',
        name: 'Airbnb Gift Card',
        slug: 'airbnb',
        category: 'Travel',
        region: 'GLOBAL',
        currency: 'USD',
        description: 'Give the gift of unforgettable trips, unique stays, and one-of-a-kind local experiences worldwide.',
        startingPrice: 25.0,
        available: true,
        image: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=600&auto=format&fit=crop&q=80',
      },
      {
        id: 'gc-uber',
        name: 'Uber & Uber Eats Card',
        slug: 'uber',
        category: 'Food & Dining',
        region: 'GLOBAL',
        currency: 'USD',
        description: 'One card for reliable rides across town or favorite meals delivered straight to your doorstep.',
        startingPrice: 15.0,
        available: true,
        image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600&auto=format&fit=crop&q=80',
      },
      {
        id: 'gc-nike',
        name: 'Nike Gift Card',
        slug: 'nike',
        category: 'Fashion',
        region: 'GLOBAL',
        currency: 'USD',
        description: 'Redeemable on Nike.com, Nike App, and Nike retail stores for premier footwear and sportswear.',
        startingPrice: 25.0,
        available: true,
        image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&auto=format&fit=crop&q=80',
      },
      {
        id: 'gc-vanilla-visa',
        name: 'Vanilla Visa Prepaid',
        slug: 'vanilla-visa',
        category: 'Prepaid',
        region: 'GLOBAL',
        currency: 'USD',
        description: 'Universal prepaid Visa card accepted everywhere Visa debit cards are honored online or in-store.',
        startingPrice: 25.0,
        available: true,
        image: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=600&auto=format&fit=crop&q=80',
      },
    ];

    for (const gc of giftCards) {
      await pool.query(
        `INSERT INTO "GiftCard" ("id", "name", "slug", "category", "region", "currency", "description", "startingPrice", "available", "image", "createdAt", "updatedAt")
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW(), NOW())
         ON CONFLICT ("id") DO UPDATE SET
           "name" = EXCLUDED."name",
           "slug" = EXCLUDED."slug",
           "category" = EXCLUDED."category",
           "description" = EXCLUDED."description",
           "startingPrice" = EXCLUDED."startingPrice",
           "available" = EXCLUDED."available",
           "image" = EXCLUDED."image",
           "updatedAt" = NOW();`,
        [gc.id, gc.name, gc.slug, gc.category, gc.region, gc.currency, gc.description, gc.startingPrice, gc.available, gc.image]
      );
    }
    console.log(`✅ Seeded ${giftCards.length} gift cards.`);

    // 3. Seed Users (Admin, Support Agent, Customer)
    const adminPassHash = await hashPassword('Electadmin100!');
    const agentPassHash = await hashPassword('SupportSecure123!');
    const customerPassHash = await hashPassword('Password123!');

    const usersToSeed = [
      {
        id: 'usr-admin-01',
        firstName: 'System',
        lastName: 'Administrator',
        email: 'admin@allcardstation.com',
        passwordHash: adminPassHash,
        role: 'ADMIN',
        phone: '+1 (555) 019-2831',
        country: 'United States',
        preferences: JSON.stringify({ theme: 'dark', notifications: true, roleAccess: 'full' }),
      },
      {
        id: 'usr-agent-01',
        firstName: 'Sarah',
        lastName: 'Connor (Support Lead)',
        email: 'support@allcardstation.com',
        passwordHash: agentPassHash,
        role: 'SUPPORT_AGENT',
        phone: '+1 (555) 302-8921',
        country: 'United Kingdom',
        preferences: JSON.stringify({ theme: 'system', autoAssign: true }),
      },
      {
        id: 'usr-customer-01',
        firstName: 'Daisy',
        lastName: 'Tucker',
        email: 'daisy4tucker@gmail.com',
        passwordHash: customerPassHash,
        role: 'CUSTOMER',
        phone: '+1 (555) 849-1029',
        country: 'United States',
        preferences: JSON.stringify({ newsletter: true, currency: 'USD', securityAlerts: true }),
      },
      {
        id: 'usr-customer-02',
        firstName: 'Alex',
        lastName: 'Morgan',
        email: 'alex.morgan@example.com',
        passwordHash: customerPassHash,
        role: 'CUSTOMER',
        phone: '+1 (555) 439-0182',
        country: 'Canada',
        preferences: JSON.stringify({ newsletter: false, currency: 'USD' }),
      },
    ];

    for (const u of usersToSeed) {
      await pool.query(
        `INSERT INTO "User" ("id", "firstName", "lastName", "email", "passwordHash", "role", "createdAt", "updatedAt")
         VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
         ON CONFLICT ("email") DO UPDATE SET
           "firstName" = EXCLUDED."firstName",
           "lastName" = EXCLUDED."lastName",
           "passwordHash" = EXCLUDED."passwordHash",
           "role" = EXCLUDED."role",
           "updatedAt" = NOW()
         RETURNING "id";`,
        [u.id, u.firstName, u.lastName, u.email, u.passwordHash, u.role]
      );

      await pool.query(
        `INSERT INTO "Profile" ("id", "userId", "phone", "country", "preferences", "createdAt", "updatedAt")
         VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
         ON CONFLICT ("userId") DO UPDATE SET
           "phone" = EXCLUDED."phone",
           "country" = EXCLUDED."country",
           "preferences" = EXCLUDED."preferences",
           "updatedAt" = NOW();`,
        [`prof-${u.id}`, u.id, u.phone, u.country, u.preferences]
      );
    }
    console.log(`✅ Seeded ${usersToSeed.length} user accounts with profiles.`);

    // 4. Seed Favorites for customer
    const favorites = [
      { id: 'fav-01', userId: 'usr-customer-01', giftCardId: 'gc-apple' },
      { id: 'fav-02', userId: 'usr-customer-01', giftCardId: 'gc-steam' },
      { id: 'fav-03', userId: 'usr-customer-01', giftCardId: 'gc-amazon' },
      { id: 'fav-04', userId: 'usr-customer-02', giftCardId: 'gc-razer' },
    ];

    for (const f of favorites) {
      await pool.query(
        `INSERT INTO "FavoriteGiftCard" ("id", "userId", "giftCardId", "createdAt")
         VALUES ($1, $2, $3, NOW())
         ON CONFLICT ("userId", "giftCardId") DO NOTHING;`,
        [f.id, f.userId, f.giftCardId]
      );
    }
    console.log(`✅ Seeded ${favorites.length} user favorites.`);

    // 5. Seed Recipients for customer
    const recipients = [
      {
        id: 'rec-01',
        userId: 'usr-customer-01',
        name: 'Marcus Vance',
        email: 'marcus.vance@example.com',
        phone: '+1 (555) 789-2341',
        relationship: 'Colleague',
      },
      {
        id: 'rec-02',
        userId: 'usr-customer-01',
        name: 'Elena Rostova',
        email: 'elena.rostova@example.com',
        phone: '+1 (555) 902-3847',
        relationship: 'Sister',
      },
      {
        id: 'rec-03',
        userId: 'usr-customer-02',
        name: 'Liam Zhang',
        email: 'liam.zhang@example.com',
        phone: '+1 (555) 438-1920',
        relationship: 'Friend',
      },
    ];

    for (const r of recipients) {
      await pool.query(
        `INSERT INTO "Recipient" ("id", "userId", "name", "email", "phone", "relationship", "createdAt", "updatedAt")
         VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
         ON CONFLICT ("id") DO NOTHING;`,
        [r.id, r.userId, r.name, r.email, r.phone, r.relationship]
      );
    }
    console.log(`✅ Seeded ${recipients.length} saved recipients.`);

    // 6. Seed Sample Live Support Conversation & Messages
    const convId = 'conv-sample-01';
    await pool.query(
      `INSERT INTO "Conversation" ("id", "userId", "visitorId", "status", "createdAt", "updatedAt")
       VALUES ($1, $2, $3, $4, NOW(), NOW())
       ON CONFLICT ("visitorId") DO UPDATE SET "status" = EXCLUDED."status", "updatedAt" = NOW();`,
      [convId, 'usr-customer-01', 'vis_daisy_session_01', 'OPEN']
    );

    const messages = [
      {
        id: 'msg-01',
        conversationId: convId,
        senderType: 'CUSTOMER',
        message: 'Hello! I wanted to check what cryptocurrency options will be accepted for Steam and Apple gift cards?',
      },
      {
        id: 'msg-02',
        conversationId: convId,
        senderType: 'AI_ASSISTANT',
        message: 'Welcome to AllCardStation Support! We support Bitcoin (BTC), Ethereum (ETH), Litecoin (LTC), Solana (SOL), and Stablecoins (USDT & USDC). Payments are processed without traditional card processing fees.',
      },
      {
        id: 'msg-03',
        conversationId: convId,
        senderType: 'SUPPORT_AGENT',
        message: 'Hi Daisy! Sarah here from Support. All payments will be processed via decentralized smart contracts and verified on-chain in Phase 3. Let us know if you need any balance validation in the meantime!',
      },
    ];

    for (const m of messages) {
      await pool.query(
        `INSERT INTO "Message" ("id", "conversationId", "senderType", "message", "createdAt")
         VALUES ($1, $2, $3, $4, NOW())
         ON CONFLICT ("id") DO NOTHING;`,
        [m.id, m.conversationId, m.senderType, m.message]
      );
    }
    console.log(`✅ Seeded support conversation with ${messages.length} messages.`);

    console.log('🎉 Database seeding completed successfully!');
    return true;
  } catch (error: any) {
    console.error('❌ Seeding failed:', error.message);
    throw error;
  } finally {
    await pool.end();
  }
}

if (process.argv[1]?.endsWith('seed.ts') || process.argv[1]?.endsWith('seed.js')) {
  seedDatabase()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}

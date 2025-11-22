# Quick Setup Guide

## Step 1: Run the Database Migration

Before seeding, you need to set up the database schema in Supabase:

1. **Go to your Supabase Dashboard**: https://supabase.com/dashboard/project/cpwfmdoxasrkotwuqizh

2. **Navigate to SQL Editor** (left sidebar)

3. **Copy the entire contents** of `supabase/migrations/001_initial_schema.sql`

4. **Paste into the SQL Editor** and click "Run"

5. **Wait for completion** - you should see "Success. No rows returned"

## Step 2: Install Dependencies

```bash
npm install
```

## Step 3: Run the Seed Script

```bash
npm run seed
```

This will:
- ✅ Create a test user account
- ✅ Create a sample trip
- ✅ Seed 30 challenges
- ✅ Create 5 sample activities
- ✅ Generate an invite code

## Step 4: Start the Development Server

```bash
npm run dev
```

## Step 5: Login

Open http://localhost:3000/login

The seed script will display your login credentials:
- **Email**: test@tripcompanion.com
- **Password**: password123

---

## Alternative: Manual Setup

If the seed script doesn't work, you can set up manually:

### 1. Create a User

Go to Supabase Dashboard → Authentication → Users → Add User

Create a user with:
- Email: your-email@example.com
- Password: your-password
- Auto Confirm User: ✓

### 2. Create Storage Bucket

Go to Supabase Dashboard → Storage → Create bucket

- Name: `trip-media`
- Public bucket: ✓

### 3. Run Migration

Copy contents of `supabase/migrations/001_initial_schema.sql` into SQL Editor and run.

### 4. Login to the App

1. Run `npm run dev`
2. Go to http://localhost:3000/login
3. Login with your credentials
4. Create your first trip!

---

## Troubleshooting

### "User already exists"
- The seed script will skip user creation if the user already exists
- You can still use the credentials: test@tripcompanion.com / password123

### "Permission denied"
- Make sure you ran the migration SQL first
- Check that RLS policies were created

### "Storage bucket not found"
- Create the bucket manually in Supabase Dashboard
- Name: `trip-media`
- Make it public

---

## What's Next?

After logging in:
1. **Create Activities** - Plan your daily schedule
2. **Add Challenges** - They're already seeded!
3. **Upload Media** - Share photos and videos
4. **Invite Friends** - Use the generated invite link
5. **Vote on Activities** - Decide what to do together

Enjoy your Trip Companion! 🎉

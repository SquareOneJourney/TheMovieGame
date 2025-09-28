# Supabase Setup Guide

## 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Sign up/Login to your account
3. Click "New Project"
4. Choose your organization
5. Enter project details:
   - Name: `movie-game`
   - Database Password: (create a strong password)
   - Region: Choose closest to your users
6. Click "Create new project"

## 2. Get Your Credentials

Once your project is created:

1. Go to **Settings** → **API**
2. Copy the following values:
   - **Project URL** (NEXT_PUBLIC_SUPABASE_URL)
   - **anon public** key (NEXT_PUBLIC_SUPABASE_ANON_KEY)

## 3. Get Database URL

1. Go to **Settings** → **Database**
2. Scroll down to "Connection string"
3. Copy the **URI** connection string
4. Replace `[YOUR-PASSWORD]` with your database password
5. This is your `DATABASE_URL`

## 4. Update Environment Variables

Add these to your `.env` file:

```env
# Database (Supabase PostgreSQL)
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres"

# Supabase
NEXT_PUBLIC_SUPABASE_URL="https://[PROJECT-REF].supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key-here"

# NextAuth.js
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"
```

## 5. Set Up Database Schema

Run these commands to set up your database:

```bash
# Generate Prisma client
npx prisma generate

# Push schema to Supabase
npx prisma db push
```

## 6. Configure Supabase Auth

1. Go to **Authentication** → **Settings**
2. Under "Site URL", add your production URL
3. Under "Redirect URLs", add:
   - `http://localhost:3000/api/auth/callback/google` (for local dev)
   - `https://your-domain.vercel.app/api/auth/callback/google` (for production)

## 7. Deploy to Vercel

1. Add the same environment variables to Vercel:
   - Go to your Vercel project settings
   - Add all the environment variables from step 4
2. Deploy your app

## 8. Test Authentication

1. Visit your app
2. Try creating an account
3. Try logging in
4. Check Supabase dashboard to see users being created

## Troubleshooting

- **Database connection issues**: Check your DATABASE_URL format
- **Auth issues**: Verify your Supabase URL and anon key
- **CORS issues**: Check your Site URL and Redirect URLs in Supabase settings

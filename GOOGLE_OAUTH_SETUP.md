# Google OAuth Setup Guide

## 1. Create Google Cloud Project
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable the Google+ API

## 2. Create OAuth Credentials
1. Go to "APIs & Services" → "Credentials"
2. Click "Create Credentials" → "OAuth 2.0 Client IDs"
3. Choose "Web application"
4. Add authorized redirect URIs:
   - `http://localhost:3002/api/auth/callback/google` (for development)
   - `https://yourdomain.com/api/auth/callback/google` (for production)

## 3. Get Your Credentials
- Copy the Client ID and Client Secret
- Add them to your `.env.local`:

```env
GOOGLE_CLIENT_ID="your-client-id-here"
GOOGLE_CLIENT_SECRET="your-client-secret-here"
```

## 4. Restart the Server
```bash
npm run dev
```

## Alternative: Use Demo Credentials
For testing, you can use the demo credentials that are already in the code, but they won't work for production.

# Google OAuth Setup Guide

Follow these steps to enable "Sign in with Google" for your Trip Companion app.

## Step 1: Set up Google Cloud Console

1. **Go to Google Cloud Console**: https://console.cloud.google.com/

2. **Create a new project** (or select existing one):
   - Click the project dropdown at the top
   - Click "New Project"
   - Name it: "Trip Companion"
   - Click "Create"

3. **Enable Google+ API**:
   - In the left sidebar, go to "APIs & Services" → "Library"
   - Search for "Google+ API"
   - Click on it and click "Enable"

4. **Configure OAuth Consent Screen**:
   - Go to "APIs & Services" → "OAuth consent screen"
   - Choose "External" (unless you have Google Workspace)
   - Click "Create"

   **App Information:**
   - App name: Trip Companion
   - User support email: your email
   - Developer contact: your email
   - Click "Save and Continue"

   **Scopes:**
   - Click "Add or Remove Scopes"
   - Add: `email`, `profile`, `openid`
   - Click "Save and Continue"

   **Test Users (Optional):**
   - Add test users if needed
   - Click "Save and Continue"

5. **Create OAuth Credentials**:
   - Go to "APIs & Services" → "Credentials"
   - Click "Create Credentials" → "OAuth client ID"
   - Application type: "Web application"
   - Name: "Trip Companion Web"

   **Authorized JavaScript origins:**
   ```
   http://localhost:3000
   https://your-app-domain.vercel.app
   ```

   **Authorized redirect URIs:**
   ```
   https://cpwfmdoxasrkotwuqizh.supabase.co/auth/v1/callback
   http://localhost:3000/auth/callback
   https://your-app-domain.vercel.app/auth/callback
   ```

   - Click "Create"
   - **COPY** the Client ID and Client Secret (you'll need these next)


624568952778-hnt720nu08vd5u9i3g8j62pcvssq0unr.apps.googleusercontent.com

## Step 2: Configure Supabase

1. **Go to your Supabase Dashboard**:
   https://supabase.com/dashboard/project/cpwfmdoxasrkotwuqizh

https://cpwfmdoxasrkotwuqizh.supabase.co/auth/v1/callback   

2. **Navigate to Authentication** → **Providers**

3. **Find "Google"** in the list and enable it

4. **Enter your credentials**:
   - **Client ID**: Paste from Google Cloud Console
   - **Client Secret**: Paste from Google Cloud Console
   - **Redirect URL**: Should already show (copy it if needed for Google Console)

5. **Click "Save"**

## Step 3: Update Redirect URLs (if needed)

1. **In Supabase** → Authentication → **URL Configuration**:
   - Site URL: `http://localhost:3000` (or your production domain)
   - Redirect URLs: Add these:
     ```
     http://localhost:3000/auth/callback
     https://your-domain.vercel.app/auth/callback
     ```

## Step 4: Test It!

1. **Start your dev server**:
   ```bash
   npm run dev
   ```

2. **Go to login page**: http://localhost:3000/login

3. **Click "Continue with Google"**

4. **Sign in with your Google account**

5. **You should be redirected to the app dashboard!**

## Troubleshooting

### "Error 400: redirect_uri_mismatch"
- Check that the redirect URI in Google Console matches exactly:
  `https://cpwfmdoxasrkotwuqizh.supabase.co/auth/v1/callback`
- No trailing slashes
- HTTPS (not HTTP) for Supabase callback

### "This app isn't verified"
- This is normal for development
- Click "Advanced" → "Go to Trip Companion (unsafe)"
- For production, submit your app for verification

### "Invalid OAuth client"
- Double-check Client ID and Secret in Supabase
- Make sure Google+ API is enabled
- Wait a few minutes after creating credentials

### Still stuck?
- Clear browser cookies and cache
- Try incognito/private mode
- Check Supabase logs: Dashboard → Logs → Auth

## Production Deployment

When deploying to production:

1. **Add production domain** to Google Console:
   - Authorized origins: `https://your-domain.vercel.app`
   - Redirect URIs: `https://your-domain.vercel.app/auth/callback`

2. **Update Supabase** URL Configuration:
   - Site URL: `https://your-domain.vercel.app`
   - Add redirect URL: `https://your-domain.vercel.app/auth/callback`

3. **(Optional) Verify your app** in Google Cloud Console:
   - Required to remove "unverified app" warning
   - Go through Google's verification process

---

That's it! Your users can now sign in with Google. 🎉

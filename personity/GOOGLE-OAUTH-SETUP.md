# Google OAuth Setup Guide

## Overview

This guide walks you through setting up Google OAuth authentication for Personity.

## Prerequisites

- A Google account
- Access to Google Cloud Console

## Step-by-Step Setup

### 1. Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click "Select a project" → "New Project"
3. Enter project name: "Personity"
4. Click "Create"

### 2. Enable Google+ API

1. In the left sidebar, go to "APIs & Services" → "Library"
2. Search for "Google+ API"
3. Click on it and click "Enable"

### 3. Configure OAuth Consent Screen

1. Go to "APIs & Services" → "OAuth consent screen"
2. Select "External" user type
3. Click "Create"
4. Fill in the required fields:
   - **App name**: Personity
   - **User support email**: Your email
   - **Developer contact email**: Your email
5. Click "Save and Continue"
6. Skip "Scopes" (click "Save and Continue")
7. Add test users if needed (for development)
8. Click "Save and Continue"

### 4. Create OAuth Credentials

1. Go to "APIs & Services" → "Credentials"
2. Click "Create Credentials" → "OAuth client ID"
3. Select "Web application"
4. Configure:
   - **Name**: Personity Web Client
   - **Authorized JavaScript origins**:
     - `http://localhost:3000` (for development)
     - `https://your-domain.com` (for production)
   - **Authorized redirect URIs**:
     - `http://localhost:3000/api/auth/google/callback` (for development)
     - `https://your-domain.com/api/auth/google/callback` (for production)
5. Click "Create"
6. Copy the **Client ID** and **Client Secret**

### 5. Update Environment Variables

Add the credentials to your `.env.local` file:

```bash
# Google OAuth
GOOGLE_CLIENT_ID=your-client-id-here.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret-here
```

### 6. Test the Integration

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Navigate to `http://localhost:3000/login`

3. Click "Continue with Google"

4. You should be redirected to Google's login page

5. After successful authentication, you should be redirected back to your dashboard

## Production Deployment

When deploying to production:

1. Update the OAuth consent screen with your production domain
2. Add production URLs to authorized origins and redirect URIs
3. Update the `NEXT_PUBLIC_APP_URL` environment variable in Vercel
4. Ensure `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` are set in Vercel environment variables

## Troubleshooting

### Error: redirect_uri_mismatch

**Problem**: The redirect URI doesn't match what's configured in Google Cloud Console.

**Solution**: 
- Check that the redirect URI in Google Cloud Console exactly matches: `http://localhost:3000/api/auth/google/callback`
- Ensure there are no trailing slashes
- Verify the protocol (http vs https)

### Error: invalid_client

**Problem**: The client ID or secret is incorrect.

**Solution**:
- Double-check the `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` in `.env.local`
- Ensure there are no extra spaces or quotes
- Regenerate credentials if needed

### Error: access_denied

**Problem**: User denied access or app is not verified.

**Solution**:
- For development, add test users in OAuth consent screen
- For production, submit app for verification (if needed)

### Users can't sign in

**Problem**: OAuth consent screen is in testing mode.

**Solution**:
- Add users as test users in Google Cloud Console
- Or publish the app (requires verification for production)

## Security Best Practices

1. **Never commit credentials**: Keep `.env.local` in `.gitignore`
2. **Use environment variables**: Store credentials in Vercel for production
3. **Rotate secrets regularly**: Generate new credentials periodically
4. **Limit scopes**: Only request necessary permissions (email and profile)
5. **Monitor usage**: Check Google Cloud Console for unusual activity

## Additional Resources

- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Google Cloud Console](https://console.cloud.google.com/)
- [OAuth 2.0 Playground](https://developers.google.com/oauthplayground/)

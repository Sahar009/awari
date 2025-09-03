# Firebase Authentication Setup

## 1. Install Firebase SDK

```bash
npm install firebase
```

## 2. Environment Variables

Create a `.env.local` file in your project root with the following variables:

```env
# Firebase Configuration
# Get these values from your Firebase project settings
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Backend API URL
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

## 3. Firebase Project Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or select existing project
3. Enable Authentication:
   - Go to Authentication > Sign-in method
   - Enable Email/Password
   - Enable Google sign-in
4. Get your configuration:
   - Go to Project Settings > General
   - Scroll down to "Your apps" section
   - Click on the web app icon or add a new web app
   - Copy the config values to your `.env.local` file

## 4. How It Works

### Frontend Flow:
1. User clicks "Sign in with Google" or submits email/password form
2. Firebase handles the authentication
3. Firebase returns an ID token
4. Frontend sends the ID token to your backend
5. Backend verifies the token with Firebase Admin SDK
6. Backend creates/updates user in your database
7. Backend returns your custom JWT token
8. Frontend stores the token and redirects user

### Backend Integration:
Your backend should have an endpoint like `/auth/google` that:
1. Receives the Firebase ID token
2. Verifies it using Firebase Admin SDK
3. Creates or updates the user in your database
4. Returns your custom JWT token

## 5. Files Created/Modified:

- `lib/firebase.ts` - Firebase configuration
- `services/firebaseAuth.ts` - Firebase authentication service
- `app/auth/login/page.tsx` - Updated to use Firebase
- `app/auth/register/page.tsx` - Updated to use Firebase

## 6. Testing

1. Make sure your backend is running
2. Start your Next.js app: `npm run dev`
3. Try signing in with Google or email/password
4. Check that the Firebase ID token is sent to your backend

## 7. Security Notes

- Never expose Firebase Admin SDK credentials on the frontend
- Always verify Firebase tokens on the backend
- Use HTTPS in production
- Configure proper CORS settings



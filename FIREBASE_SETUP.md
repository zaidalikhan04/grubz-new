# Firebase Setup Guide

This guide will help you set up Firebase for your Grubz food delivery application.

## Prerequisites

- A Google account
- Node.js and npm installed
- Your React application running

## Step 1: Create a Firebase Project

1. Go to the [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project" or "Add project"
3. Enter your project name (e.g., "grubz-food-delivery")
4. Choose whether to enable Google Analytics (recommended)
5. Select or create a Google Analytics account if you enabled it
6. Click "Create project"

## Step 2: Set up Firebase Authentication

1. In your Firebase project console, click on "Authentication" in the left sidebar
2. Click "Get started"
3. Go to the "Sign-in method" tab
4. Enable "Email/Password" authentication:
   - Click on "Email/Password"
   - Toggle "Enable" to ON
   - Click "Save"

## Step 3: Set up Firestore Database

1. In your Firebase project console, click on "Firestore Database" in the left sidebar
2. Click "Create database"
3. Choose "Start in test mode" for now (you can secure it later)
4. Select a location for your database (choose the closest to your users)
5. Click "Done"

## Step 4: Get Your Firebase Configuration

1. In your Firebase project console, click on the gear icon (⚙️) next to "Project Overview"
2. Select "Project settings"
3. Scroll down to the "Your apps" section
4. Click on the web icon (</>) to add a web app
5. Enter an app nickname (e.g., "grubz-web-app")
6. Check "Also set up Firebase Hosting" if you want to deploy to Firebase (optional)
7. Click "Register app"
8. Copy the Firebase configuration object

## Step 5: Configure Your Application

1. Open the `.env.local` file in your project root
2. Replace the placeholder values with your actual Firebase configuration:

```env
VITE_FIREBASE_API_KEY=your-actual-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-actual-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-actual-sender-id
VITE_FIREBASE_APP_ID=your-actual-app-id
VITE_FIREBASE_MEASUREMENT_ID=your-actual-measurement-id
```

## Step 6: Set up Firestore Security Rules

1. In your Firebase project console, go to "Firestore Database"
2. Click on the "Rules" tab
3. Replace the default rules with the comprehensive CRUD rules from `firestore.rules` file:

**IMPORTANT**: Copy the contents of the `firestore.rules` file in your project root and paste them into the Firebase console.

The rules include:
- **Admin Full Access**: Admins can perform all CRUD operations on any collection
- **User Management**: Users can read/update their own data, only admins can delete users
- **Restaurant Management**: Public read, owner/admin write access
- **Order Management**: Participants can read/write their orders
- **Driver Management**: Drivers manage their profiles, admins have full access
- **Partner Requests**: Users create, admins approve/deny
- **Audit Logs**: Admin-only access for tracking changes
- **Enhanced Security**: Role-based permissions with proper validation

4. Click "Publish" to apply the rules

## Step 6.1: Verify Firebase Rules

After setting up the rules, test them using the admin dashboard:

1. Login as admin (`admin@grubz.com` / `password123`)
2. Go to User Management
3. Click "Test Firebase" button to verify permissions
4. Try creating, reading, updating, and deleting users

If the test fails, check:
- Rules are properly published in Firebase console
- Admin user has correct role in Firestore
- No syntax errors in the rules

## Step 7: Test Your Setup

1. Restart your development server:
   ```bash
   npm run dev
   ```

2. Try logging in with the default admin account:
   - Email: `admin@grubz.com`
   - Password: `password123`

3. If successful, you should see the admin dashboard and the user data should be stored in Firestore.

## Step 8: Create Additional Test Users (Optional)

You can create test users for different roles:

1. **Customer**: 
   - Email: `customer@test.com`
   - Role: `customer`

2. **Restaurant Owner**: 
   - Email: `restaurant@test.com`
   - Role: `restaurant_owner`

3. **Delivery Driver**: 
   - Email: `driver@test.com`
   - Role: `delivery_rider`

## Firestore Collections Structure

Your application will create the following collections:

- **users**: User profiles and authentication data
- **restaurants**: Restaurant information and menus
- **orders**: Order data and status
- **drivers**: Driver profiles and status

## Next Steps

1. **Secure your database**: Update Firestore security rules for production
2. **Add indexes**: Create composite indexes for complex queries
3. **Set up Cloud Functions**: For server-side logic (optional)
4. **Configure Storage**: For image uploads (restaurant photos, user avatars)
5. **Set up Analytics**: Track user behavior and app performance

## Troubleshooting

### Common Issues:

1. **"Firebase not initialized"**: Make sure your `.env.local` file has the correct values
2. **"Permission denied"**: Check your Firestore security rules
3. **"Network error"**: Verify your Firebase project is active and billing is set up if needed

### Getting Help:

- [Firebase Documentation](https://firebase.google.com/docs)
- [Firestore Documentation](https://firebase.google.com/docs/firestore)
- [Firebase Auth Documentation](https://firebase.google.com/docs/auth)

## Security Notes

- Never commit your `.env.local` file to version control
- Use environment-specific configurations for development, staging, and production
- Regularly review and update your Firestore security rules
- Enable App Check for additional security in production

# Firebase Rules Deployment Guide

## 🚀 Quick Setup

### Step 1: Deploy Firestore Rules

1. **Open Firebase Console**
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Select your project

2. **Navigate to Firestore Rules**
   - Click "Firestore Database" in the left sidebar
   - Click the "Rules" tab

3. **Copy and Paste Rules**
   - Open the `firestore.rules` file in your project root
   - Copy ALL the content
   - Paste it into the Firebase console rules editor
   - Click "Publish"

### Step 2: Verify Rules Deployment

1. **Login to Admin Dashboard**
   - Go to http://localhost:5174/
   - Login with: `admin@grubz.com` / `password123`

2. **Test Firebase Connection**
   - Navigate to "User Management"
   - Click "Test Firebase" button
   - Should show "Firebase Connection Test Passed"

3. **Test User Operations**
   - Try viewing users (should work)
   - Try deleting a test user (should work)
   - Check console for detailed logs

## 🔧 Troubleshooting

### Common Issues

#### 1. "Permission Denied" Errors
**Symptoms**: Cannot read/write to Firestore
**Solutions**:
- Verify rules are published in Firebase console
- Check admin user has `role: 'admin'` in Firestore
- Ensure user is properly authenticated

#### 2. User Deletion Not Working
**Symptoms**: User appears deleted but still exists
**Solutions**:
- Check Firestore console to verify deletion
- Look for error messages in browser console
- Verify admin permissions in rules

#### 3. "Test Firebase" Button Fails
**Symptoms**: Connection test shows errors
**Solutions**:
- Check internet connection
- Verify Firebase config in `src/config/firebase.ts`
- Ensure Firestore is enabled in Firebase console

### Debug Steps

1. **Check Browser Console**
   ```
   F12 → Console tab
   Look for Firebase-related errors
   ```

2. **Check Firebase Console**
   ```
   Firebase Console → Firestore → Data
   Verify user documents exist/deleted
   ```

3. **Check Network Tab**
   ```
   F12 → Network tab
   Look for failed Firebase requests
   ```

## 📋 Rule Features

### Admin Capabilities
- ✅ Full CRUD access to all collections
- ✅ User management (create, read, update, delete)
- ✅ Restaurant management
- ✅ Order management
- ✅ Driver management
- ✅ Partner request approval
- ✅ System settings access
- ✅ Audit log access

### User Capabilities
- ✅ Read/update own profile
- ✅ Create orders
- ✅ Read own orders
- ✅ Apply for partner roles

### Restaurant Owner Capabilities
- ✅ Manage own restaurants
- ✅ View/update own orders
- ✅ Read customer orders for their restaurants

### Driver Capabilities
- ✅ Manage own driver profile
- ✅ View/update assigned deliveries
- ✅ Update delivery status

## 🔐 Security Features

### Role-Based Access Control
- Users can only access their own data
- Admins have full system access
- Restaurant owners limited to their restaurants
- Drivers limited to their deliveries

### Data Validation
- Email validation on user creation
- Required fields enforcement
- Role-based field restrictions

### Audit Logging
- All admin actions logged
- User deletion tracking
- System change monitoring

## 🧪 Testing Checklist

### Before Deployment
- [ ] Rules syntax is valid
- [ ] Admin user exists with correct role
- [ ] Test user creation/deletion
- [ ] Verify role-based access

### After Deployment
- [ ] Admin login works
- [ ] User management functions
- [ ] Firebase test passes
- [ ] No console errors
- [ ] Audit logs created

## 📞 Support

If you encounter issues:

1. **Check the logs**: Browser console and Firebase console
2. **Verify setup**: Follow this guide step-by-step
3. **Test incrementally**: Start with simple operations
4. **Check permissions**: Ensure proper role assignments

## 🎯 Success Indicators

You'll know everything is working when:
- ✅ Admin can login without email verification
- ✅ "Test Firebase" button shows success
- ✅ Users can be deleted from admin dashboard
- ✅ Deleted users disappear from Firestore
- ✅ No permission errors in console
- ✅ Audit logs are created for admin actions

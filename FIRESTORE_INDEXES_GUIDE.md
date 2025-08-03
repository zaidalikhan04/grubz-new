# Firestore Indexes Setup Guide

## 🎯 Purpose
These indexes are required for the ordering system to work properly with real-time queries and sorting.

## 📋 Required Indexes

### 1. Customer Orders Index
- **Collection**: `orders`
- **Fields**: 
  - `customerId` (Ascending)
  - `createdAt` (Descending)
- **Purpose**: Customer order history with newest first

### 2. Restaurant Orders Index
- **Collection**: `orders`
- **Fields**: 
  - `restaurantId` (Ascending)
  - `createdAt` (Descending)
- **Purpose**: Restaurant order management with newest first

### 3. Driver Orders Index
- **Collection**: `orders`
- **Fields**: 
  - `assignedDriverId` (Ascending)
  - `createdAt` (Descending)
- **Purpose**: Driver assigned orders with newest first

### 4. Order Status Index
- **Collection**: `orders`
- **Fields**: 
  - `status` (Ascending)
  - `createdAt` (Descending)
- **Purpose**: Filter orders by status (ready, pending, etc.)

### 5. Active Restaurants Index
- **Collection**: `restaurants`
- **Fields**: 
  - `isActive` (Ascending)
  - `createdAt` (Descending)
- **Purpose**: Show only active restaurants

### 6. Restaurant Status Index
- **Collection**: `restaurants`
- **Fields**: 
  - `status` (Ascending)
  - `createdAt` (Descending)
- **Purpose**: Filter restaurants by approval status

### 7. User Role Index
- **Collection**: `users`
- **Fields**: 
  - `role` (Ascending)
  - `createdAt` (Descending)
- **Purpose**: Query users by role (admin, customer, etc.)

## 🚀 Deployment Options

### Option 1: Automatic Deployment (Recommended)
```bash
# Make the script executable
chmod +x deploy-indexes.js

# Run the deployment script
node deploy-indexes.js
```

### Option 2: Firebase CLI Manual Deployment
```bash
# Deploy indexes using Firebase CLI
firebase deploy --only firestore:indexes
```

### Option 3: Manual Creation in Firebase Console

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project
3. Navigate to **Firestore Database** → **Indexes**
4. Click **Create Index** for each index above
5. Configure fields as specified

## 🔧 After Deployment

1. **Wait for indexes to build** (2-10 minutes depending on data size)
2. **Enable orderBy in code** - Uncomment the orderBy lines in:
   - `src/services/order.ts` (lines 257, 290, 321)
3. **Test the application** - All real-time queries should now work properly

## 🐛 Troubleshooting

### Index Build Errors
- Check Firebase Console for specific error messages
- Ensure field names match exactly (case-sensitive)
- Verify collection names are correct

### Query Still Failing
- Wait for index status to show "Enabled" in console
- Clear browser cache and refresh application
- Check browser console for specific error messages

### Performance Issues
- Indexes are building in background
- Large datasets may take longer to index
- Monitor index build progress in Firebase Console

## 📊 Index Status Monitoring

Check index status at:
`Firebase Console → Firestore Database → Indexes`

Status indicators:
- 🟡 **Building**: Index is being created
- 🟢 **Enabled**: Index is ready for use
- 🔴 **Error**: Index creation failed

## 🔄 Code Changes After Index Deployment

Once indexes are deployed and enabled, update `src/services/order.ts`:

```typescript
// Uncomment these lines:
// Line 257: orderBy('createdAt', 'desc')
// Line 290: orderBy('createdAt', 'desc') 
// Line 321: orderBy('createdAt', 'desc')
```

This will enable proper sorting of orders by creation date.

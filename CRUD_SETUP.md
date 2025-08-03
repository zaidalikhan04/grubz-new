# Real-time CRUD Functionality Setup Guide

## Overview
This guide explains how to set up and use the real-time CRUD (Create, Read, Update, Delete) functionality in your application using Firebase.

## Prerequisites
1. Firebase account
2. Firebase project created
3. Firestore database enabled in your Firebase project

## Setup Steps

### 1. Environment Variables
Create a `.env` file in the project root and add your Firebase configuration:
```env
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain_here
VITE_FIREBASE_PROJECT_ID=your_project_id_here
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket_here
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id_here
VITE_FIREBASE_APP_ID=your_app_id_here
```

### 2. Firebase Rules
Set up Firestore security rules in your Firebase console:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

## Usage

### 1. Using the CRUD Service
```typescript
import { CrudService } from '../services/crudService';

// Initialize the service with a collection name
const crudService = new CrudService('your_collection_name');

// Create
const newDocId = await crudService.create({ field: 'value' });

// Read
const doc = await crudService.read(docId);

// Update
await crudService.update(docId, { field: 'new value' });

// Delete
await crudService.delete(docId);

// Real-time updates
const unsubscribe = crudService.subscribeToChanges((data) => {
  console.log('Updated data:', data);
});

// Cleanup subscription
unsubscribe();
```

### 2. Using the CRUD Hook
```typescript
import { useCrud } from '../hooks/useCrud';

function YourComponent() {
  const {
    data,
    loading,
    error,
    create,
    read,
    update,
    remove,
    query
  } = useCrud({ collectionName: 'your_collection_name' });

  // Data is automatically updated in real-time
  console.log('Current data:', data);

  // Create
  await create({ field: 'value' });

  // Update
  await update(docId, { field: 'new value' });

  // Delete
  await remove(docId);

  // Query
  const results = await query('field', '==', 'value');
}
```

### 3. Example Component
An example component is available at `/crud-example` route, demonstrating all CRUD operations with real-time updates.

## Best Practices
1. Always handle loading and error states
2. Unsubscribe from real-time listeners when components unmount
3. Use appropriate security rules in production
4. Implement proper error handling
5. Consider implementing pagination for large collections

## Troubleshooting
1. Ensure all environment variables are properly set
2. Check Firebase console for any errors
3. Verify Firestore rules are properly configured
4. Check browser console for detailed error messages

## Security Considerations
1. Never expose Firebase credentials in client-side code
2. Implement proper authentication
3. Set up appropriate Firestore security rules
4. Validate data before writing to the database
5. Implement rate limiting in production
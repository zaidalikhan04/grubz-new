import React, { useState, useEffect } from 'react';
import { auth, db } from '../config/firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
// import { initializeMenuData } from '../utils/initializeMenuData';

export const FirebaseTest: React.FC = () => {
  const [status, setStatus] = useState<string>('Testing Firebase connection...');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    testFirebaseConnection();
  }, []);

  const testFirebaseConnection = async () => {
    try {
      setStatus('Testing Firebase configuration...');
      
      // Test 1: Check if Firebase is initialized
      if (!auth || !db) {
        throw new Error('Firebase not properly initialized');
      }
      setStatus('✅ Firebase initialized successfully');

      // Test 2: Test Firestore connection
      setStatus('Testing Firestore connection...');
      const testDoc = doc(db, 'test', 'connection');
      await setDoc(testDoc, { test: true, timestamp: new Date() });
      const docSnap = await getDoc(testDoc);
      
      if (docSnap.exists()) {
        setStatus('✅ Firestore connection successful');
      } else {
        throw new Error('Failed to write/read from Firestore');
      }

      // Test 3: Test Authentication
      setStatus('Testing Authentication...');
      
      // Try to create the admin user
      try {
        const userCredential = await createUserWithEmailAndPassword(auth, 'admin@grubz.com', 'password123');
        setStatus('✅ Admin user created successfully');
        
        // Create user document in Firestore
        await setDoc(doc(db, 'users', userCredential.user.uid), {
          email: 'admin@grubz.com',
          name: 'System Administrator',
          role: 'admin',
          createdAt: new Date(),
          updatedAt: new Date()
        });
        
        // Test 4: Initialize default menu data
        setStatus('Initializing default menu data...');
        // await initializeMenuData();

        setStatus('✅ All tests passed! You can now login with admin@grubz.com / password123');
      } catch (authError: any) {
        if (authError.code === 'auth/email-already-in-use') {
          setStatus('✅ Admin user already exists. You can login with admin@grubz.com / password123');
        } else {
          throw authError;
        }
      }

    } catch (error: any) {
      console.error('Firebase test error:', error);
      setError(`❌ Error: ${error.message}`);
      setStatus('Firebase connection failed');
    }
  };

  const testLogin = async () => {
    try {
      setStatus('Testing login...');
      const userCredential = await signInWithEmailAndPassword(auth, 'admin@grubz.com', 'password123');
      setStatus(`✅ Login successful! User ID: ${userCredential.user.uid}`);
    } catch (error: any) {
      setError(`❌ Login failed: ${error.message}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
        <h1 className="text-2xl font-bold mb-6 text-center">Firebase Connection Test</h1>
        
        <div className="space-y-4">
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="font-medium text-blue-800 mb-2">Status:</h3>
            <p className="text-sm text-blue-700">{status}</p>
          </div>

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <h3 className="font-medium text-red-800 mb-2">Error:</h3>
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <div className="space-y-2">
            <button
              onClick={testFirebaseConnection}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700"
            >
              Re-test Connection
            </button>
            
            <button
              onClick={testLogin}
              className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700"
            >
              Test Login
            </button>
          </div>

          <div className="text-xs text-gray-500 space-y-1">
            <p><strong>Project ID:</strong> {import.meta.env.VITE_FIREBASE_PROJECT_ID}</p>
            <p><strong>Auth Domain:</strong> {import.meta.env.VITE_FIREBASE_AUTH_DOMAIN}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

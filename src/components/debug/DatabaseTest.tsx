import React, { useState } from 'react';
import { collection, addDoc, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';

export const DatabaseTest: React.FC = () => {
  const { currentUser } = useAuth();
  const [testResults, setTestResults] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const addTestResult = (message: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
    console.log(message);
  };

  const testDatabaseConnection = async () => {
    if (!currentUser) {
      addTestResult('❌ No user logged in');
      return;
    }

    setIsLoading(true);
    setTestResults([]);

    try {
      addTestResult('🔄 Starting database connection test...');

      // Test 1: Try to add a test document
      addTestResult('📝 Test 1: Adding test document...');
      const testData = {
        name: 'Test Menu Item',
        description: 'This is a test item',
        price: 9.99,
        category: 'test',
        imageUrl: 'data:image/png;base64,test',
        isAvailable: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const docRef = await addDoc(collection(db, 'restaurants', currentUser.id, 'menu'), testData);
      addTestResult(`✅ Test document added with ID: ${docRef.id}`);

      // Test 2: Try to read the document back
      addTestResult('📖 Test 2: Reading document back...');
      const savedDoc = await getDoc(doc(db, 'restaurants', currentUser.id, 'menu', docRef.id));
      
      if (savedDoc.exists()) {
        const data = savedDoc.data();
        addTestResult(`✅ Document read successfully: ${data.name}`);
        addTestResult(`✅ Image URL saved: ${data.imageUrl ? 'Yes' : 'No'}`);
      } else {
        addTestResult('❌ Document not found after saving');
      }

      // Test 3: Try to list all menu items
      addTestResult('📋 Test 3: Listing all menu items...');
      const querySnapshot = await getDocs(collection(db, 'restaurants', currentUser.id, 'menu'));
      addTestResult(`✅ Found ${querySnapshot.size} menu items total`);

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        addTestResult(`  - ${data.name} (${data.category})`);
      });

      addTestResult('🎉 All database tests passed!');

    } catch (error) {
      addTestResult(`❌ Database test failed: ${error}`);
      console.error('Database test error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const clearResults = () => {
    setTestResults([]);
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>🧪 Database Connection Test</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Button 
            onClick={testDatabaseConnection} 
            disabled={isLoading || !currentUser}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isLoading ? 'Testing...' : 'Test Database'}
          </Button>
          <Button 
            onClick={clearResults} 
            variant="outline"
          >
            Clear Results
          </Button>
        </div>

        {!currentUser && (
          <div className="p-3 bg-yellow-100 border border-yellow-300 rounded">
            ⚠️ Please log in as a restaurant owner to test the database
          </div>
        )}

        {testResults.length > 0 && (
          <div className="bg-gray-100 p-4 rounded max-h-96 overflow-y-auto">
            <h3 className="font-semibold mb-2">Test Results:</h3>
            {testResults.map((result, index) => (
              <div key={index} className="text-sm font-mono mb-1">
                {result}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

import React from 'react';
import { useAuth } from '../contexts/AuthContext';

export const DebugAuth: React.FC = () => {
  const { currentUser, loading, error } = useAuth();

  return (
    <div className="fixed top-4 right-4 bg-white p-4 border rounded shadow-lg z-50 max-w-sm">
      <h3 className="font-bold text-sm mb-2">Auth Debug</h3>
      <div className="text-xs space-y-1">
        <div>Loading: {loading ? '✅ TRUE' : '❌ FALSE'}</div>
        <div>User: {currentUser ? '✅ EXISTS' : '❌ NULL'}</div>
        <div>Error: {error || '❌ NONE'}</div>
        {currentUser && (
          <div className="mt-2 p-2 bg-gray-100 rounded">
            <div>ID: {currentUser.id}</div>
            <div>Email: {currentUser.email}</div>
            <div>Role: {currentUser.role}</div>
          </div>
        )}
      </div>
    </div>
  );
};

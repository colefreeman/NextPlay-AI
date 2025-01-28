// src/components/Shared/ErrorState.jsx
import React from 'react';
import { AlertTriangle } from 'lucide-react';

const ErrorState = ({ error, retry }) => (
  <div className="flex flex-col items-center justify-center p-8 text-center">
    <AlertTriangle size={48} className="text-red-500 mb-4" />
    <h3 className="text-lg font-medium text-red-500 mb-2">
      Something went wrong
    </h3>
    <p className="text-gray-400 mb-4">
      {error.message || 'An error occurred. Please try again.'}
    </p>
    {retry && (
      <button
        onClick={retry}
        className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
      >
        Try Again
      </button>
    )}
  </div>
);

export default ErrorState;
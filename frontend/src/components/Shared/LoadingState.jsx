// src/components/Shared/LoadingState.jsx
import React from 'react';

const LoadingState = () => (
  <div className="flex justify-center items-center p-8">
    <div className="relative">
      <div className="w-12 h-12 border-4 border-blue-200 rounded-full"></div>
      <div className="w-12 h-12 border-4 border-blue-500 rounded-full animate-spin absolute top-0 left-0 border-t-transparent"></div>
    </div>
  </div>
);

export default LoadingState;
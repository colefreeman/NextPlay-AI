import React from 'react';

const LoadingState = ({ size = 'medium', message = 'Loading...' }) => {
  const sizeClasses = {
    small: 'w-8 h-8 border-2',
    medium: 'w-12 h-12 border-4',
    large: 'w-16 h-16 border-4'
  };

  const spinnerSize = sizeClasses[size] || sizeClasses.medium;

  return (
    <div className="flex flex-col justify-center items-center p-8" role="status">
      <div className="relative">
        <div className={`${spinnerSize} border-blue-200 rounded-full`}></div>
        <div 
          className={`${spinnerSize} border-blue-500 rounded-full animate-spin absolute top-0 left-0 border-t-transparent`}
        ></div>
      </div>
      {message && (
        <p className="mt-4 text-gray-400 text-sm">
          {message}
        </p>
      )}
      <span className="sr-only">Loading</span>
    </div>
  );
};

export default LoadingState;
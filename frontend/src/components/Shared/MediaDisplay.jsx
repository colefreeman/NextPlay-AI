// src/components/Shared/MediaDisplay.jsx
import React, { useState } from 'react';
import { Play } from 'lucide-react';

const MediaDisplay = ({ media, type, altText }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  const handleLoad = () => setIsLoading(false);
  const handleError = () => {
    setIsLoading(false);
    setError(true);
  };

  if (error) {
    return (
      <div className="bg-gray-700 rounded-lg p-4 text-center text-gray-400">
        Failed to load media
      </div>
    );
  }

  return (
    <div className="relative">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-700">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}

      {type === 'IMAGE' ? (
        <img
          src={media}
          alt={altText || 'Post image'}
          className="w-full rounded-lg"
          onLoad={handleLoad}
          onError={handleError}
        />
      ) : type === 'VIDEO' ? (
        <div className="relative aspect-video">
          <video
            src={media}
            controls
            className="w-full rounded-lg"
            onLoadedData={handleLoad}
            onError={handleError}
          />
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-700 rounded-lg">
              <Play size={48} className="text-gray-400" />
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
};

export default MediaDisplay;
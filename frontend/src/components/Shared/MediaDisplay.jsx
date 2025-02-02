import React, { useState } from 'react';
import { Play, FileText, Link2, AlertCircle } from 'lucide-react';

const MediaDisplay = ({ media, type, thumbnailUrl, title, altText }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  const handleLoad = () => setIsLoading(false);
  const handleError = () => {
    setIsLoading(false);
    setError(true);
  };

  if (error) {
    return (
      <div className="bg-gray-700 rounded-lg p-6 text-center text-gray-400">
        <AlertCircle className="mx-auto mb-2" size={24} />
        <p>Failed to load media</p>
      </div>
    );
  }

  const renderMedia = () => {
    switch (type) {
      case 'IMAGE':
        return (
          <img
            src={media}
            alt={altText || title || 'Post image'}
            className="w-full rounded-lg"
            onLoad={handleLoad}
            onError={handleError}
          />
        );

      case 'VIDEO':
        return (
          <div className="relative aspect-video">
            <video
              src={media}
              poster={thumbnailUrl}
              controls
              className="w-full rounded-lg"
              onLoadedData={handleLoad}
              onError={handleError}
            >
              Your browser does not support the video tag.
            </video>
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-700 rounded-lg">
                <Play size={48} className="text-gray-400" />
              </div>
            )}
          </div>
        );

      case 'DOCUMENT':
        return (
          <a
            href={media}
            target="_blank"
            rel="noopener noreferrer"
            className="block bg-gray-700 rounded-lg p-4 hover:bg-gray-600 transition-colors"
          >
            <div className="flex items-center space-x-3">
              <FileText size={24} className="text-blue-400" />
              <span className="text-white">{title || 'View Document'}</span>
            </div>
          </a>
        );

      case 'LINK':
        return (
          <a
            href={media}
            target="_blank"
            rel="noopener noreferrer"
            className="block bg-gray-700 rounded-lg p-4 hover:bg-gray-600 transition-colors"
          >
            <div className="flex items-center space-x-3">
              <Link2 size={24} className="text-blue-400" />
              <span className="text-white">{title || media}</span>
            </div>
          </a>
        );

      default:
        return null;
    }
  };

  return (
    <div className="relative">
      {isLoading && type !== 'DOCUMENT' && type !== 'LINK' && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-700">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
      {renderMedia()}
    </div>
  );
};

export default MediaDisplay;
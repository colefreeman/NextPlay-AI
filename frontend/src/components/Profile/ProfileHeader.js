// src/components/Profile/ProfileHeader.js
import React from 'react';

const ProfileHeader = () => {
  return (
    <div className="bg-[#2d2d2d] rounded-lg p-6 mb-6">
      <div className="flex items-center space-x-6">
        <div className="relative">
          <div className="w-24 h-24 bg-[#3d3d3d] rounded-full overflow-hidden">
            {/* Profile picture will go here */}
          </div>
          <button className="absolute bottom-0 right-0 bg-blue-500 p-2 rounded-full hover:bg-blue-600">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </button>
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">Cole Freeman</h1>
          <p className="text-gray-400">Software Developer</p>
        </div>
      </div>
    </div>
  );
};

export default ProfileHeader;
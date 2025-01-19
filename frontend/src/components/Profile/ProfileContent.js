// src/components/Profile/ProfileContent.js
import React from 'react';

const ProfileContent = () => {
  return (
    <div className="bg-[#2d2d2d] rounded-lg p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h2 className="text-xl font-semibold text-white mb-4">About Me</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Bio</label>
              <p className="text-white">Software developer passionate about creating innovative solutions.</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Location</label>
              <p className="text-white">San Francisco, CA</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Joined</label>
              <p className="text-white">January 19, 2025</p>
            </div>
          </div>
        </div>
        <div>
          <h2 className="text-xl font-semibold text-white mb-4">Skills & Interests</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Skills</label>
              <div className="flex flex-wrap gap-2">
                <span className="bg-[#3d3d3d] px-3 py-1 rounded-full text-sm text-white">JavaScript</span>
                <span className="bg-[#3d3d3d] px-3 py-1 rounded-full text-sm text-white">React</span>
                <span className="bg-[#3d3d3d] px-3 py-1 rounded-full text-sm text-white">Node.js</span>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Interests</label>
              <div className="flex flex-wrap gap-2">
                <span className="bg-[#3d3d3d] px-3 py-1 rounded-full text-sm text-white">Web Development</span>
                <span className="bg-[#3d3d3d] px-3 py-1 rounded-full text-sm text-white">UI/UX Design</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileContent;
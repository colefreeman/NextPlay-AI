// frontend/src/components/Profile/ProfileContent.js
import React, { useState, useEffect } from 'react';

const ProfileContent = ({ userData, isEditing, onSave }) => {
  const [formData, setFormData] = useState(userData);
  const [profilePicture, setProfilePicture] = useState(null);

  useEffect(() => {
    setFormData(userData);
  }, [userData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSkillsChange = (e) => {
    const skills = e.target.value.split(',').map(skill => skill.trim());
    setFormData(prev => ({
      ...prev,
      skills
    }));
  };

  const handleInterestsChange = (e) => {
    const interests = e.target.value.split(',').map(interest => interest.trim());
    setFormData(prev => ({
      ...prev,
      interests
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setProfilePicture(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formDataToSubmit = new FormData();
    
    // Append profile picture if exists
    if (profilePicture) {
      formDataToSubmit.append('profilePicture', profilePicture);
    }

    // Append other form data
    Object.keys(formData).forEach(key => {
      if (Array.isArray(formData[key])) {
        formDataToSubmit.append(key, JSON.stringify(formData[key]));
      } else {
        formDataToSubmit.append(key, formData[key]);
      }
    });

    await onSave(formData);
  };

  if (!isEditing) {
    return (
      <div className="bg-[#2d2d2d] rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h2 className="text-xl font-semibold text-white mb-4">About Me</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Bio</label>
                <p className="text-white">{userData.bio || 'No bio added yet'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Location</label>
                <p className="text-white">{userData.location || 'No location added'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Role</label>
                <p className="text-white">{userData.role || 'No role specified'}</p>
              </div>
            </div>
          </div>
          <div>
            <h2 className="text-xl font-semibold text-white mb-4">Skills & Interests</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Skills</label>
                <div className="flex flex-wrap gap-2">
                  {userData.skills?.length > 0 ? (
                    userData.skills.map((skill, index) => (
                      <span key={index} className="bg-[#3d3d3d] px-3 py-1 rounded-full text-sm text-white">
                        {skill}
                      </span>
                    ))
                  ) : (
                    <span className="text-gray-400">No skills added</span>
                  )}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Interests</label>
                <div className="flex flex-wrap gap-2">
                  {userData.interests?.length > 0 ? (
                    userData.interests.map((interest, index) => (
                      <span key={index} className="bg-[#3d3d3d] px-3 py-1 rounded-full text-sm text-white">
                        {interest}
                      </span>
                    ))
                  ) : (
                    <span className="text-gray-400">No interests added</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-[#2d2d2d] rounded-lg p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h2 className="text-xl font-semibold text-white mb-4">Edit Profile</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-white mb-1">Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full bg-[#3d3d3d] text-white rounded-lg p-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white mb-1">Bio</label>
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                className="w-full bg-[#3d3d3d] text-white rounded-lg p-2 h-32"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white mb-1">Location</label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                className="w-full bg-[#3d3d3d] text-white rounded-lg p-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white mb-1">Role</label>
              <input
                type="text"
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full bg-[#3d3d3d] text-white rounded-lg p-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white mb-1">Profile Picture</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="w-full text-white"
              />
            </div>
          </div>
        </div>
        <div>
          <h2 className="text-xl font-semibold text-white mb-4">Skills & Interests</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-white mb-1">Skills (comma-separated)</label>
              <textarea
                name="skills"
                value={formData.skills?.join(', ')}
                onChange={handleSkillsChange}
                className="w-full bg-[#3d3d3d] text-white rounded-lg p-2 h-32"
                placeholder="JavaScript, React, Node.js"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white mb-1">Interests (comma-separated)</label>
              <textarea
                name="interests"
                value={formData.interests?.join(', ')}
                onChange={handleInterestsChange}
                className="w-full bg-[#3d3d3d] text-white rounded-lg p-2 h-32"
                placeholder="Web Development, UI/UX Design"
              />
            </div>
          </div>
        </div>
      </div>
      <div className="mt-6 flex justify-end">
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Save Changes
        </button>
      </div>
    </form>
  );
};

export default ProfileContent;
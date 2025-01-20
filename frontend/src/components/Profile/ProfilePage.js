// frontend/src/components/Profile/ProfilePage.js
import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Navbar from '../Layout/Navbar';
import Sidebar from '../Layout/Sidebar';
import ProfileHeader from './ProfileHeader';
import ProfileContent from './ProfileContent';

const ProfilePage = () => {
  const { user } = useAuth();
  console.log("Profile Page User:", user);  // Added debug log
  const [isEditing, setIsEditing] = useState(false);
  
  const [userData, setUserData] = useState({
    name: user?.email?.split('@')[0] || '',
    email: user?.email || '',
    joinedDate: '2025-01-19 19:51:41',
    role: '',
    bio: '',
    location: '',
    skills: [],
    interests: []
  });

  const handleSave = async (updatedData) => {
    try {
      const response = await fetch('/api/profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          ...updatedData
        })
      });

      if (response.ok) {
        setUserData(updatedData);
        setIsEditing(false);
      }
    } catch (error) {
      console.error('Error saving profile:', error);
    }
  };

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user?.id) return;

      try {
        const response = await fetch(`/api/profile/${user.id}`);
        if (response.ok) {
          const data = await response.json();
          if (data) {
            setUserData(prevData => ({
              ...prevData,
              ...data,
              email: user.email,
              name: data.name || user.email.split('@')[0]
            }));
          }
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
      }
    };

    fetchProfile();
  }, [user]);

  if (!user) {
    return <Navigate to="/login" />;
  }

  return (
    <div className="min-h-screen bg-[#1a1a1a]">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <div className="flex-1 p-8">
          <div className="max-w-4xl mx-auto">
            <div className="flex justify-between mb-4">
              <h1 className="text-white text-2xl">My Profile</h1>
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                {isEditing ? 'Cancel' : 'Edit Profile'}
              </button>
            </div>
            <ProfileHeader userData={userData} />
            <ProfileContent 
              userData={userData}
              isEditing={isEditing}
              onSave={handleSave}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
// frontend/src/components/Profile/ProfilePage.js
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import Navbar from '../Layout/Navbar';
import Sidebar from '../Layout/Sidebar';
import ProfileHeader from './ProfileHeader';
import ProfileContent from './ProfileContent';

const ProfilePage = () => {
  const { user } = useAuth();
  console.log("ProfilePage - Current User:", user); // Debug log
  const [isEditing, setIsEditing] = useState(false);
  
  const [userData, setUserData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    joinedDate: new Date().toISOString().split('T')[0], // Just the date part
    role: user?.role || '',
    bio: '',
    location: '',
    skills: [],
    interests: []
  });

  const handleSave = async (updatedData) => {
    try {
      // Remove any datetime objects from the data
      const { updatedAt, ...cleanData } = updatedData;
      
      const response = await fetch('http://localhost:4000/api/profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          userId: user.id,
          ...cleanData,
          joinedDate: new Date().toISOString().split('T')[0] // Just the date part
        })
      });

      if (response.ok) {
        const savedData = await response.json();
        setUserData(savedData);
        setIsEditing(false);
      }
    } catch (error) {
      console.error('Error saving profile:', error);
    }
  };

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user?.id) {
        console.log("No user ID available");
        return;
      }

      try {
        console.log("Fetching profile for user:", user.id);
        const response = await fetch(`http://localhost:4000/api/profile/${user.id}`, {
          credentials: 'include'
        });
        if (response.ok) {
          const data = await response.json();
          console.log("Profile data received:", data);
          if (data) {
            setUserData(prevData => ({
              ...prevData,
              ...data,
              email: user.email,
              name: data.name || user.name
            }));
          }
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
      }
    };

    if (user) {
      fetchProfile();
    }
  }, [user]);

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
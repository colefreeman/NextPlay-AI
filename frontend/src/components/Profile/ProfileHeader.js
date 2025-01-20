// src/components/Profile/ProfileHeader.js
import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';

const ProfileHeader = ({ userData }) => {
 const { user } = useAuth();
 const [isUploading, setIsUploading] = useState(false);

 const handleImageUpload = async (e) => {
   const file = e.target.files[0];
   if (!file) return;

   setIsUploading(true);
   const formData = new FormData();
   formData.append('profilePicture', file);
   formData.append('userId', user.id);

   try {
     const response = await fetch('http://localhost:4000/api/profile/upload-photo', {
       method: 'POST',
       credentials: 'include',
       body: formData,
     });

     if (response.ok) {
       window.location.reload();
     }
   } catch (error) {
     console.error('Error uploading profile picture:', error);
   } finally {
     setIsUploading(false);
   }
 };

 return (
   <div className="bg-[#2d2d2d] rounded-lg p-6 mb-6">
     <div className="flex items-center space-x-6">
       <div className="relative">
         <div className="w-24 h-24 bg-[#3d3d3d] rounded-full overflow-hidden">
           {userData?.profilePicture ? (
             <img 
               src={userData.profilePicture}
               alt="Profile"
               className="w-full h-full object-cover"
             />
           ) : (
             <div className="w-full h-full flex items-center justify-center text-gray-400">
               No Photo
             </div>
           )}
         </div>
         <label className={`absolute bottom-0 right-0 bg-blue-500 p-2 rounded-full hover:bg-blue-600 cursor-pointer ${
           isUploading ? 'opacity-50 cursor-not-allowed' : ''
         }`}>
           <input 
             type="file" 
             className="hidden" 
             accept="image/*"
             onChange={handleImageUpload}
             disabled={isUploading}
           />
           {isUploading ? (
             <svg className="w-4 h-4 text-white animate-spin" viewBox="0 0 24 24">
               <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
               <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
             </svg>
           ) : (
             <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
             </svg>
           )}
         </label>
       </div>
       <div>
         <h1 className="text-2xl font-bold text-white">{userData?.name || 'No Name'}</h1>
         <p className="text-gray-400">{userData?.role || 'No Role Set'}</p>
       </div>
     </div>
   </div>
 );
};

export default ProfileHeader;
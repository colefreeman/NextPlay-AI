// pages/CreatePost.jsx
import React, { useState } from 'react';
import { useMutation } from '@apollo/client';
import { useNavigate } from 'react-router-dom';
import { CREATE_POST } from '../graphql/mutations/postMutations';
import { GET_FEED } from '../graphql/queries/feedQueries';
import ErrorState from '../components/Shared/ErrorState';

export default function CreatePost() {
 const navigate = useNavigate();
 const [formData, setFormData] = useState({
   type: 'TEXT',
   content: {
     text: '',
     hashtags: [],
     mediaUrls: []
   },
   visibility: 'PUBLIC',
   category: 'TEAM_UPDATE'
 });

 const [createPost, { loading, error }] = useMutation(CREATE_POST, {
   update(cache, { data: { createPost } }) {
     // Update feed cache with new post
     const { feed } = cache.readQuery({ 
       query: GET_FEED,
       variables: { filter: { visibility: ['PUBLIC'] }, pagination: { limit: 10 } }
     });
     
     cache.writeQuery({
       query: GET_FEED,
       variables: { filter: { visibility: ['PUBLIC'] }, pagination: { limit: 10 } },
       data: { 
         feed: {
           ...feed,
           posts: [createPost, ...feed.posts]
         }
       }
     });
   },
   onCompleted() {
     navigate('/feed');
   }
 });

 const handleSubmit = async (e) => {
   e.preventDefault();
   try {
     await createPost({
       variables: {
         input: formData
       }
     });
   } catch (err) {
     console.error('Error creating post:', err);
   }
 };

 if (error) return <ErrorState error={error} />;

 return (
   <div className="max-w-2xl mx-auto p-4">
     <h1 className="text-2xl font-bold mb-6">Create Post</h1>
     
     <form onSubmit={handleSubmit} className="space-y-6">
       {/* Post Type */}
       <div>
         <label className="block text-sm font-medium mb-2">Post Type</label>
         <select
           value={formData.type}
           onChange={(e) => setFormData({...formData, type: e.target.value})}
           className="w-full p-2 border rounded"
         >
           <option value="TEXT">Text</option>
           <option value="IMAGE">Image</option>
           <option value="VIDEO">Video</option>
         </select>
       </div>

       {/* Content */}
       <div>
         <label className="block text-sm font-medium mb-2">Content</label>
         <textarea
           value={formData.content.text}
           onChange={(e) => setFormData({
             ...formData,
             content: { ...formData.content, text: e.target.value }
           })}
           className="w-full p-2 border rounded min-h-[100px]"
           placeholder="What's on your mind?"
         />
       </div>

       {/* Visibility */}
       <div>
         <label className="block text-sm font-medium mb-2">Visibility</label>
         <select
           value={formData.visibility}
           onChange={(e) => setFormData({...formData, visibility: e.target.value})}
           className="w-full p-2 border rounded"
         >
           <option value="PUBLIC">Public</option>
           <option value="TEAM">Team Only</option>
           <option value="PRIVATE">Private</option>
         </select>
       </div>

       {/* Category */}
       <div>
         <label className="block text-sm font-medium mb-2">Category</label>
         <select
           value={formData.category}
           onChange={(e) => setFormData({...formData, category: e.target.value})}
           className="w-full p-2 border rounded"
         >
           <option value="TEAM_UPDATE">Team Update</option>
           <option value="ACHIEVEMENT">Achievement</option>
           <option value="TRAINING">Training</option>
           <option value="PROJECT_UPDATE">Project Update</option>
           <option value="INDUSTRY_NEWS">Industry News</option>
         </select>
       </div>

       <button
         type="submit"
         disabled={loading}
         className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 disabled:bg-blue-300"
       >
         {loading ? 'Creating...' : 'Create Post'}
       </button>
     </form>
   </div>
 );
}
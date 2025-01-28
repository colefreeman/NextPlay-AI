// pages/Explore.jsx
import React, { useState } from 'react';
import { useQuery } from '@apollo/client';
import PostCard from '../components/Feed/PostCard';
import LoadingState from '../components/Shared/LoadingState';
import ErrorState from '../components/Shared/ErrorState';
import { GET_TRENDING_POSTS } from '../graphql/queries/feedQueries';

export default function Explore() {
 const [category, setCategory] = useState(null);
 
 const { loading, error, data } = useQuery(GET_TRENDING_POSTS, {
   variables: { category },
   fetchPolicy: 'cache-and-network'
 });

 const categories = [
   'ACHIEVEMENT',
   'TRAINING',
   'TEAM_UPDATE',
   'PROJECT_UPDATE',
   'INDUSTRY_NEWS'
 ];

 if (loading && !data) return <LoadingState />;
 if (error) return <ErrorState error={error} />;

 return (
   <div className="max-w-4xl mx-auto p-4">
     <h1 className="text-2xl font-bold mb-6">Explore</h1>
     
     {/* Category Filter */}
     <div className="flex gap-2 mb-6 overflow-x-auto">
       <button
         onClick={() => setCategory(null)}
         className={`px-4 py-2 rounded-full ${!category ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
       >
         All
       </button>
       {categories.map(cat => (
         <button
           key={cat}
           onClick={() => setCategory(cat)}
           className={`px-4 py-2 rounded-full ${category === cat ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
         >
           {cat.replace('_', ' ')}
         </button>
       ))}
     </div>

     {/* Posts Grid */}
     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
       {data.trending.map(post => (
         <PostCard key={post.id} post={post} />
       ))}
     </div>
   </div>
 );
}

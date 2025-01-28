// pages/Profile.jsx
import React from 'react';
import { useQuery } from '@apollo/client';
import { useParams } from 'react-router-dom';
import UserInfo from '../components/Profile/UserInfo';
import UserPosts from '../components/Profile/UserPosts';
import LoadingState from '../components/Shared/LoadingState';
import ErrorState from '../components/Shared/ErrorState';
import { GET_USER_PROFILE } from '../graphql/queries/profileQueries';

export default function Profile() {
 const { userId } = useParams();
 const { loading, error, data } = useQuery(GET_USER_PROFILE, {
   variables: { userId },
   fetchPolicy: 'cache-and-network'
 });

 if (loading && !data) return <LoadingState />;
 if (error) return <ErrorState error={error} />;

 return (
   <div className="max-w-4xl mx-auto p-4">
     <UserInfo user={data.user} />
     <div className="mt-8">
       <UserPosts 
         userId={userId}
         initialPosts={data.user.posts}
       />
     </div>
   </div>
 );
}
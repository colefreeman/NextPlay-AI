// src/pages/Feed.jsx
import React, { useState } from 'react';
import { useQuery } from '@apollo/client';
import MainFeed from '../components/Feed/MainFeed';
import CreatePost from '../components/Feed/CreatePost';
import LoadingState from '../components/Shared/LoadingState';
import ErrorState from '../components/Shared/ErrorState';
import { GET_FEED } from '../graphql/queries/feedQueries';

const Feed = () => {
  // eslint-disable-next-line
  const [feedFilter, setFeedFilter] = useState({ 
    visibility: ['PUBLIC'],
    types: null,
    categories: null
  });
  const [pageSize] = useState(10);

  const { loading, error, data, fetchMore } = useQuery(GET_FEED, {
    variables: {
      filter: feedFilter,
      pagination: { limit: pageSize }
    }
  });

  const handleLoadMore = () => {
    if (data?.feed?.pageInfo?.endCursor) {
      fetchMore({
        variables: {
          pagination: {
            cursor: data.feed.pageInfo.endCursor,
            limit: pageSize
          }
        }
      });
    }
  };

  const handleFilterChange = (newFilters) => {
    setFeedFilter(prev => ({
      ...prev,
      ...newFilters
    }));
  };

  if (loading && !data) return <LoadingState />;
  if (error) return <ErrorState error={error} />;

  return (
    <div className="max-w-2xl mx-auto p-4">
      {/* Filter UI */}
      <div className="mb-6 space-y-4">
        <div className="flex gap-2 overflow-x-auto pb-2">
          <button 
            onClick={() => handleFilterChange({ types: null })}
            className={`px-4 py-2 rounded-lg ${
              !feedFilter.types ? 'bg-blue-600 text-white' : 'bg-gray-800 text-white'
            }`}
          >
            All Posts
          </button>
          <button 
            onClick={() => handleFilterChange({ types: ['IMAGE'] })}
            className={`px-4 py-2 rounded-lg ${
              feedFilter.types?.includes('IMAGE') ? 'bg-blue-600 text-white' : 'bg-gray-800 text-white'
            }`}
          >
            Images Only
          </button>
          <button 
            onClick={() => handleFilterChange({ types: ['TEXT'] })}
            className={`px-4 py-2 rounded-lg ${
              feedFilter.types?.includes('TEXT') ? 'bg-blue-600 text-white' : 'bg-gray-800 text-white'
            }`}
          >
            Text Only
          </button>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2">
          <button 
            onClick={() => handleFilterChange({ categories: null })}
            className={`px-4 py-2 rounded-lg ${
              !feedFilter.categories ? 'bg-blue-600 text-white' : 'bg-gray-800 text-white'
            }`}
          >
            All Categories
          </button>
          {['ACHIEVEMENT', 'TRAINING', 'TEAM_UPDATE'].map(category => (
            <button 
              key={category}
              onClick={() => handleFilterChange({ categories: [category] })}
              className={`px-4 py-2 rounded-lg ${
                feedFilter.categories?.includes(category) ? 'bg-blue-600 text-white' : 'bg-gray-800 text-white'
              }`}
            >
              {category.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-6">
        <CreatePost />
      </div>

      <MainFeed 
        posts={data?.feed?.posts} 
        onLoadMore={handleLoadMore}
        hasMore={data?.feed?.pageInfo?.hasNextPage}
      />
    </div>
  );
};

export default Feed;
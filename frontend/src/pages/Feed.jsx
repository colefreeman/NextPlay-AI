// src/pages/Feed.jsx
import React, { useState } from 'react';
import { useQuery } from '@apollo/client';
import MainFeed from '../components/Feed/MainFeed';
import CreatePost from '../components/Feed/CreatePost';
import LoadingState from '../components/Shared/LoadingState';
import ErrorState from '../components/Shared/ErrorState';
import { GET_FEED, validateFeedResponse, monitorQueryPerformance, debugFeedQuery } from '../graphql/queries/feedQueries';

const Feed = () => {
  console.log('Feed component rendered');
  
  // eslint-disable-next-line
  const [feedFilter, setFeedFilter] = useState({ 
    visibility: ['PUBLIC'],
    types: null,
    categories: null
  });
  const [pageSize] = useState(10);
  const [queryStartTime] = useState(Date.now());

  // Enhanced debugging - log initial props
  console.log('Initial Feed Props:', {
    feedFilter,
    pageSize,
    timestamp: new Date().toISOString()
  });

  const { loading, error, data, fetchMore, client } = useQuery(GET_FEED, {
    variables: {
      filter: feedFilter,
      pagination: { limit: pageSize }
    },
    onError: (error) => {
      debugFeedQuery(error);
      console.error('Feed Query Error:', {
        message: error.message,
        networkError: error.networkError?.result?.errors || error.networkError,
        graphQLErrors: error.graphQLErrors,
        operation: error.operation?.operationName,
        variables: error.operation?.variables,
        status: error.networkError?.statusCode,
        clientReady: client?.isReady?.(),
        queryManager: client?.queryManager?.state,
        timestamp: new Date().toISOString()
      });
    },
    onCompleted: (data) => {
      const duration = monitorQueryPerformance('GET_FEED', queryStartTime);
      const validation = validateFeedResponse(data);
      
      console.log('Query completed:', {
        duration: `${duration}ms`,
        validationResult: validation,
        dataExists: !!data,
        feedExists: !!data?.feed,
        postsCount: data?.feed?.posts?.length,
        timestamp: new Date().toISOString()
      });
    },
    fetchPolicy: 'network-only',
    errorPolicy: 'all',
    notifyOnNetworkStatusChange: true
  });

  console.log('Query state:', { 
    loading, 
    hasError: !!error, 
    hasData: !!data,
    timestamp: new Date().toISOString()
  });

  const handleLoadMore = () => {
    const loadMoreStartTime = Date.now();
    console.log('Loading more posts...', {
      currentEndCursor: data?.feed?.pageInfo?.endCursor,
      timestamp: new Date().toISOString()
    });
    
    if (data?.feed?.pageInfo?.endCursor) {
      fetchMore({
        variables: {
          pagination: {
            cursor: data.feed.pageInfo.endCursor,
            limit: pageSize
          }
        }
      }).then(() => {
        monitorQueryPerformance('LOAD_MORE', loadMoreStartTime);
        console.log('Successfully loaded more posts', {
          timestamp: new Date().toISOString()
        });
      }).catch((error) => {
        debugFeedQuery(error);
        console.error('Error loading more posts:', {
          error,
          timestamp: new Date().toISOString()
        });
      });
    }
  };

  const handleFilterChange = (newFilters) => {
    console.log('Applying new filters:', {
      currentFilters: feedFilter,
      newFilters,
      timestamp: new Date().toISOString()
    });
    setFeedFilter(prev => ({
      ...prev,
      ...newFilters
    }));
  };

  if (loading && !data) {
    console.log('Showing loading state', {
      timestamp: new Date().toISOString()
    });
    return <LoadingState />;
  }
  
  if (error) {
    console.log('Showing error state:', {
      error,
      timestamp: new Date().toISOString()
    });
    return <ErrorState error={error} />;
  }

  // Validate data before rendering
  const validation = validateFeedResponse(data);
  if (!validation.isValid) {
    console.warn('Feed data validation failed:', validation.issues);
  }

  console.log('Rendering feed with data:', {
    postsCount: data?.feed?.posts?.length,
    hasNextPage: data?.feed?.pageInfo?.hasNextPage,
    timestamp: new Date().toISOString()
  });

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
        key={JSON.stringify(feedFilter)}
        posts={data?.feed?.posts || []} 
        onLoadMore={handleLoadMore}
        hasMore={Boolean(data?.feed?.pageInfo?.hasNextPage)}
      />
    </div>
  );
};

export default Feed;
import React from 'react';
import { useQuery } from '@apollo/client';
import PostCard from './PostCard';
import LoadingState from '../Shared/LoadingState';
import ErrorState from '../Shared/ErrorState';
import { GET_FEED, validateFeedResponse } from '../../graphql/queries/feedQueries';

const MainFeed = () => {
  const { loading, error, data, fetchMore } = useQuery(GET_FEED, {
    variables: {
      filter: { visibility: ['PUBLIC'] },
      pagination: { limit: 10 }
    },
    onCompleted: (data) => {
      const validation = validateFeedResponse(data);
      if (!validation.isValid) {
        console.warn('Feed validation issues:', validation.issues);
      }
    }
  });

  const handleLoadMore = () => {
    if (data?.feed?.pageInfo?.endCursor) {
      fetchMore({
        variables: {
          pagination: {
            cursor: data.feed.pageInfo.endCursor,
            limit: 10
          }
        },
        updateQuery: (prevResult, { fetchMoreResult }) => {
          if (!fetchMoreResult) return prevResult;
          return {
            feed: {
              ...fetchMoreResult.feed,
              posts: [
                ...prevResult.feed.posts,
                ...fetchMoreResult.feed.posts
              ]
            }
          };
        }
      });
    }
  };

  if (loading && !data) return <LoadingState />;
  if (error) return <ErrorState error={error} />;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {data?.feed?.posts?.map(post => (
        <PostCard 
          key={post.id} 
          post={post}
        />
      ))}
      
      {data?.feed?.pageInfo?.hasNextPage && (
        <button
          onClick={handleLoadMore}
          className="w-full py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors"
        >
          {loading ? 'Loading more...' : 'Load More'}
        </button>
      )}

      {data?.feed?.posts?.length === 0 && (
        <div className="text-center py-10 text-gray-400">
          No posts to show. Follow more people or create a post!
        </div>
      )}
    </div>
  );
};

export default MainFeed;
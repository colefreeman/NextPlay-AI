import { gql } from '@apollo/client';

// Debug function to log query execution with detailed information
export const logQueryExecution = (queryName, variables, options = {}) => {
  const timestamp = new Date().toISOString();
  console.group(`GraphQL Query Execution: ${queryName}`);
  console.log('Timestamp:', timestamp);
  console.log('Variables:', variables);
  console.log('Options:', options);
  console.groupEnd();
};

// Query field fragments for reuse and consistency
const POST_FIELDS = gql`
  fragment PostFields on Post {
    id
    author {
      id
      name
      profile {
        profilePicture
      }
    }
    content {
      text
      hashtags
      mediaUrls
      mediaType
      thumbnailUrl
      title
    }
    visibility
    settings {  # This field is non-nullable on the server
      allowComments
      allowShares
      allowReactions
    }
    createdAt
    metrics {
      likeCount
      commentCount
      shareCount
    }
  }
`;

const PAGE_INFO_FIELDS = gql`
  fragment PageInfoFields on PageInfo {
    hasNextPage
    endCursor
  }
`;

// Main feed query with logging wrapper and fragments
export const GET_FEED = gql`
  query GetFeed($filter: FeedFilter, $pagination: PaginationInput) {
    feed(filter: $filter, pagination: $pagination) {
      posts {
        id
        author {
          id
          name
          profile {
            profilePicture
          }
        }
        content {
          text
          hashtags
          mediaUrls
          title
        }
        visibility
        createdAt
        metrics {
          likeCount
          commentCount
          shareCount
        }
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
`;

// Trending posts query with logging wrapper and fragments
export const GET_TRENDING_POSTS = gql`
  ${POST_FIELDS}
  query GetTrendingPosts($category: String) {
    trending(category: $category) {
      ...PostFields
    }
  }
`;

// Helper function to validate feed response
export const validateFeedResponse = (data) => {
  const timestamp = new Date().toISOString();
  console.group('Feed Response Validation');
  console.log('Timestamp:', timestamp);
  
  const validation = {
    hasData: !!data,
    hasFeed: !!data?.feed,
    hasPosts: !!data?.feed?.posts,
    postsCount: data?.feed?.posts?.length || 0,
    hasPageInfo: !!data?.feed?.pageInfo,
    hasNextPage: !!data?.feed?.pageInfo?.hasNextPage,
    endCursor: data?.feed?.pageInfo?.endCursor
  };

  console.log('Validation Results:', validation);
  
  // Check for potential issues
  const issues = [];
  if (!validation.hasData) issues.push('No data received');
  if (!validation.hasFeed) issues.push('No feed object in response');
  if (!validation.hasPosts) issues.push('No posts array in feed');
  if (!validation.hasPageInfo) issues.push('No pageInfo in feed');
  
  if (issues.length > 0) {
    console.warn('Validation Issues Found:', issues);
  }
  
  console.groupEnd();
  
  return {
    isValid: issues.length === 0,
    issues,
    validation
  };
};

// Helper function to monitor query performance
export const monitorQueryPerformance = (queryName, startTime) => {
  const endTime = Date.now();
  const duration = endTime - startTime;
  console.log(`Query ${queryName} Performance:`, {
    startTime: new Date(startTime).toISOString(),
    endTime: new Date(endTime).toISOString(),
    duration: `${duration}ms`
  });
  
  // Flag slow queries
  if (duration > 1000) {
    console.warn(`Slow query detected: ${queryName} took ${duration}ms`);
  }
  
  return duration;
};

export const debugFeedQuery = (error) => {
  console.group('Feed Query Debug Information');
  console.log('Timestamp:', new Date().toISOString());
  
  if (error) {
    console.error('Query Error:', {
      message: error.message,
      networkError: error.networkError?.result?.errors || error.networkError,
      graphQLErrors: error.graphQLErrors,
      operation: error.operation?.operationName,
      variables: error.operation?.variables,
      stack: error.stack
    });
  }
  
  console.groupEnd();
};
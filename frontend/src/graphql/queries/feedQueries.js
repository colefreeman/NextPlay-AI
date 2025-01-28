// src/graphql/queries/feedQueries.js
import { gql } from '@apollo/client';

export const GET_FEED = gql`
  query GetFeed($filter: FeedFilter, $pagination: PaginationInput) {
    feed(filter: $filter, pagination: $pagination) {
      posts {
        id
        author {
          id
          name
          profile {
            avatarUrl
          }
        }
        type
        content {
          text
          hashtags
          mediaUrls
          mediaType
          thumbnailUrl
          title
        }
        visibility
        createdAt
        metrics {
          likeCount
          commentCount
          shareCount
        }
        professional {
          category
        }
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
`;

export const GET_TRENDING_POSTS = gql`
  query GetTrendingPosts($category: ProfessionalCategory) {
    trending(category: $category) {
      id
      author {
        id
        name
        profile {
          avatarUrl
        }
      }
      type
      content {
        text
        hashtags
        mediaUrls
        mediaType
        thumbnailUrl
        title
      }
      professional {
        category
      }
      metrics {
        likeCount
        commentCount
        shareCount
      }
      createdAt
    }
  }
`;
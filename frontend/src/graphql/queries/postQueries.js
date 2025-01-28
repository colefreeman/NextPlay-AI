// src/graphql/queries/postQueries.js
import { gql } from '@apollo/client';

export const GET_POST = gql`
  query GetPost($id: ID!) {
    post(id: $id) {
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
      settings {
        allowComments
        allowShares
        allowReactions
      }
    }
  }
`;

export const GET_USER_POSTS = gql`
  query GetUserPosts($userId: ID!, $filter: PostFilter) {
    userPosts(userId: $userId, filter: $filter) {
      id
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

export const GET_TEAM_POSTS = gql`
  query GetTeamPosts($teamId: ID!, $filter: PostFilter) {
    teamPosts(teamId: $teamId, filter: $filter) {
      id
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
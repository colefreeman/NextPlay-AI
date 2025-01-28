// src/graphql/queries/profileQueries.js
import { gql } from '@apollo/client';

export const GET_PROFILE = gql`
  query GetProfile($username: String!) {
    getProfile(username: $username) {
      id
      userId
      firstName
      lastName
      bio
      location
      avatarUrl
      joinedDate
      lastActive
      profileUrl
      socialLinks {
        platform
        url
      }
      skills
      interests
    }
  }
`;

export const GET_CURRENT_USER_PROFILE = gql`
  query GetCurrentUserProfile {
    getCurrentUserProfile {
      id
      userId
      firstName
      lastName
      bio
      location
      avatarUrl
      joinedDate
      lastActive
      profileUrl
      socialLinks {
        platform
        url
      }
      skills
      interests
    }
  }
`;
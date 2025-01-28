// src/graphql/mutations/engagementMutations.js
import { gql } from '@apollo/client';

export const ENGAGE_POST = gql`
  mutation EngagePost($postId: ID!, $action: EngagementAction!) {
    engagePost(postId: $postId, action: $action) {
      success
      post {
        id
        metrics {
          likeCount
          commentCount
          shareCount
        }
      }
    }
  }
`;

export const UPDATE_POST_SETTINGS = gql`
  mutation UpdatePostSettings($postId: ID!, $settings: PostSettingsInput!) {
    updatePostSettings(postId: $postId, settings: $settings) {
      id
      settings {
        allowComments
        allowShares
        allowReactions
        isPinned
        isFeatured
      }
    }
  }
`;
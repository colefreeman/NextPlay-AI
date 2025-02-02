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
        engagement {
          isLiked
          isShared
          isSaved
        }
      }
    }
  }
`;

export const CREATE_COMMENT = gql`
  mutation CreateComment($postId: ID!, $content: String!) {
    createComment(postId: $postId, content: $content) {
      id
      content
      createdAt
      user {
        id
        name
        profile {
          profilePicture
        }
      }
      post {
        id
        metrics {
          commentCount
        }
      }
    }
  }
`;

export const DELETE_COMMENT = gql`
  mutation DeleteComment($commentId: ID!) {
    deleteComment(commentId: $commentId) {
      success
      post {
        id
        metrics {
          commentCount
        }
      }
    }
  }
`;

export const SHARE_POST = gql`
  mutation SharePost($postId: ID!, $content: String) {
    sharePost(postId: $postId, content: $content) {
      success
      post {
        id
        metrics {
          shareCount
        }
      }
    }
  }
`;

export const SAVE_POST = gql`
  mutation SavePost($postId: ID!) {
    savePost(postId: $postId) {
      success
      post {
        id
        engagement {
          isSaved
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

// Helper type definitions for reference
/*
enum EngagementAction {
  LIKE
  UNLIKE
  SHARE
  UNSHARE
  SAVE
  UNSAVE
}

type PostMetrics {
  likeCount: Int!
  commentCount: Int!
  shareCount: Int!
}

type PostEngagement {
  isLiked: Boolean!
  isShared: Boolean!
  isSaved: Boolean!
}

input PostSettingsInput {
  allowComments: Boolean
  allowShares: Boolean
  allowReactions: Boolean
  isPinned: Boolean
  isFeatured: Boolean
}
*/
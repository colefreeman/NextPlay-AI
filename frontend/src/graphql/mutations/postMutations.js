// src/graphql/mutations/postMutations.js
import { gql } from '@apollo/client';

export const CREATE_POST = gql`
  mutation CreatePost($input: CreatePostInput!) {
    createPost(input: $input) {
      id
      type
      content {
        text
        hashtags
        mediaUrls
        title
      }
      visibility
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

export const UPDATE_POST = gql`
  mutation UpdatePost($id: ID!, $input: UpdatePostInput!) {
    updatePost(id: $id, input: $input) {
      id
      content {
        text
        hashtags
        mediaUrls
        title
      }
      visibility
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

export const DELETE_POST = gql`
  mutation DeletePost($id: ID!) {
    deletePost(id: $id)
  }
`;
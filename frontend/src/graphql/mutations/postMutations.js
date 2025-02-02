import { gql } from '@apollo/client';

export const CREATE_POST = gql`
  mutation CreatePost($input: CreatePostInput!) {
    createPost(input: $input) {
      id
      type
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
      }
      createdAt
    }
  }
`;

export const DELETE_POST = gql`
  mutation DeletePost($id: ID!) {
    deletePost(id: $id)
  }
`;
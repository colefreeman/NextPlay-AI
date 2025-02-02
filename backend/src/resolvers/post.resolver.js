const postService = require('../services/post.service');

const postResolvers = {
  Query: {
    post: async (_, { id }) => {
      try {
        const post = await postService.getPost(id);
        if (!post) {
          throw new Error(`Post not found with id: ${id}`);
        }
        return post;
      } catch (error) {
        console.error('Error in post query:', error);
        throw error;
      }
    },

    userPosts: async (_, { userId, filter }) => {
      try {
        const posts = await postService.getUserPosts(userId, filter);
        return posts;
      } catch (error) {
        console.error('Error in userPosts query:', error);
        throw error;
      }
    },

    teamPosts: async (_, { teamId, filter }) => {
      try {
        const posts = await postService.getTeamPosts(teamId, filter);
        return posts;
      } catch (error) {
        console.error('Error in teamPosts query:', error);
        throw error;
      }
    }
  },

  Mutation: {
    createPost: async (_, { input }, { user }) => {
      try {
        if (!user || !user.id) {
          throw new Error('User not authenticated');
        }
        
        console.log('Creating post with input:', input);
        console.log('User ID:', user.id);
        
        const post = await postService.createPost(input, user.id);
        
        if (!post) {
          throw new Error('Failed to create post');
        }
        
        console.log('Created post:', post);
        return post;
      } catch (error) {
        console.error('Error in createPost mutation:', error);
        throw error;
      }
    },

    updatePost: async (_, { id, input }, { user }) => {
      try {
        if (!user || !user.id) {
          throw new Error('User not authenticated');
        }

        const post = await postService.updatePost(id, input, user.id);
        
        if (!post) {
          throw new Error(`Failed to update post with id: ${id}`);
        }
        
        return post;
      } catch (error) {
        console.error('Error in updatePost mutation:', error);
        throw error;
      }
    },

    deletePost: async (_, { id }, { user }) => {
      try {
        if (!user || !user.id) {
          throw new Error('User not authenticated');
        }

        const result = await postService.deletePost(id, user.id);
        
        if (!result) {
          throw new Error(`Failed to delete post with id: ${id}`);
        }
        
        return result;
      } catch (error) {
        console.error('Error in deletePost mutation:', error);
        throw error;
      }
    },

    updatePostSettings: async (_, { postId, settings }, { user }) => {
      try {
        if (!user || !user.id) {
          throw new Error('User not authenticated');
        }

        const post = await postService.updateSettings(postId, settings, user.id);
        
        if (!post) {
          throw new Error(`Failed to update settings for post with id: ${postId}`);
        }
        
        return post;
      } catch (error) {
        console.error('Error in updatePostSettings mutation:', error);
        throw error;
      }
    }
  }
};

module.exports = postResolvers;
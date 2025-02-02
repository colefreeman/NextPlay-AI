const neo4jService = require('./neo4j.service');

class PostService {
  async createPost(input, userId) {
    try {
      console.log('PostService: Creating post with input:', input);
      console.log('PostService: User ID:', userId);

      if (!input || !userId) {
        throw new Error('Invalid input or userId');
      }

      const post = await neo4jService.createPost(input, userId);
      
      if (!post) {
        throw new Error('Failed to create post in database');
      }

      console.log('PostService: Created post:', post);
      return post;
    } catch (error) {
      console.error('PostService: Error creating post:', error);
      throw error;
    }
  }

  async getPost(postId) {
    try {
      if (!postId) {
        throw new Error('Post ID is required');
      }

      const post = await neo4jService.getPost(postId);
      
      if (!post) {
        throw new Error(`Post not found with id: ${postId}`);
      }

      return post;
    } catch (error) {
      console.error('PostService: Error getting post:', error);
      throw error;
    }
  }

  async updatePost(postId, input) {
    try {
      if (!postId || !input) {
        throw new Error('Post ID and input are required');
      }

      const post = await neo4jService.updatePost(postId, input);
      
      if (!post) {
        throw new Error(`Failed to update post with id: ${postId}`);
      }

      return post;
    } catch (error) {
      console.error('PostService: Error updating post:', error);
      throw error;
    }
  }

  async deletePost(postId) {
    try {
      if (!postId) {
        throw new Error('Post ID is required');
      }

      const result = await neo4jService.deletePost(postId);
      
      if (!result) {
        throw new Error(`Failed to delete post with id: ${postId}`);
      }

      return result;
    } catch (error) {
      console.error('PostService: Error deleting post:', error);
      throw error;
    }
  }
}

module.exports = new PostService();
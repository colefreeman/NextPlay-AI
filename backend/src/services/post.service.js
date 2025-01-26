// services/post.service.js
const neo4jService = require('./neo4j.service');

class PostService {
  async createPost(input, userId) {
    return neo4jService.createPost(input, userId);
  }

  async getPost(postId) {
    return neo4jService.getPost(postId);
  }

  async updatePost(postId, input) {
    return neo4jService.updatePost(postId, input);
  }

  async deletePost(postId) {
    return neo4jService.deletePost(postId);
  }
}

module.exports = new PostService();
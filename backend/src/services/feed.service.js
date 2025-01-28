// services/feed.service.js
const neo4jService = require('./neo4j.service');

class FeedService {
  async getFeed(filter, pagination) {
    // Ensure pagination values are integers before passing to neo4jService
    const sanitizedPagination = {
      limit: Math.floor(Number(pagination?.limit)) || 10,
      cursor: pagination?.cursor
    };
    return neo4jService.getFeed(filter, sanitizedPagination);
  }

  async getTrendingPosts(category) {
    return neo4jService.getTrendingPosts(category);
  }

  async getUserFeed(userId, filter, pagination) {
    const sanitizedPagination = {
      limit: Math.floor(Number(pagination?.limit)) || 10,
      cursor: pagination?.cursor
    };
    return neo4jService.getUserFeed(userId, filter, sanitizedPagination);
  }

  async getTeamFeed(teamId, filter, pagination) {
    const sanitizedPagination = {
      limit: Math.floor(Number(pagination?.limit)) || 10,
      cursor: pagination?.cursor
    };
    return neo4jService.getTeamFeed(teamId, filter, sanitizedPagination);
  }

  async getDiscoveryFeed(filter, pagination) {
    const sanitizedPagination = {
      limit: Math.floor(Number(pagination?.limit)) || 10,
      cursor: pagination?.cursor
    };
    return neo4jService.getDiscoveryFeed(filter, sanitizedPagination);
  }

  async getPostAuthor(postId) {
    return neo4jService.getPostAuthor(postId);
  }

  async getPostContent(postId) {
    return neo4jService.getPostContent(postId);
  }

  async getPostLikes(postId) {
    return neo4jService.getPostLikes(postId);
  }

  async getPostComments(postId) {
    return neo4jService.getPostComments(postId);
  }

  async getPostShares(postId) {
    return neo4jService.getPostShares(postId);
  }

  async getPostSaves(postId) {
    return neo4jService.getPostSaves(postId);
  }

  async getPostProfessionalContent(postId) {
    return neo4jService.getPostProfessionalContent(postId);
  }

  async getPostSocialFeatures(postId) {
    return neo4jService.getPostSocialFeatures(postId);
  }
}

module.exports = new FeedService();
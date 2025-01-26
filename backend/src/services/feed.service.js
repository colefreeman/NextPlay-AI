// services/feed.service.js
const neo4jService = require('./neo4j.service');

class FeedService {
 async getFeed(filter, pagination) {
   return neo4jService.getFeed(filter, pagination);
 }

 async getTrendingPosts(category) {
   return neo4jService.getTrendingPosts(category);
 }

 async getUserFeed(userId, filter, pagination) {
   return neo4jService.getUserFeed(userId, filter, pagination);
 }

 async getTeamFeed(teamId, filter, pagination) {
   return neo4jService.getTeamFeed(teamId, filter, pagination);
 }

 async getDiscoveryFeed(filter, pagination) {
   return neo4jService.getDiscoveryFeed(filter, pagination);
 }
}

module.exports = new FeedService();
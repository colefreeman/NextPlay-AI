// services/engagement.service.js
const neo4jService = require('./neo4j.service');

class EngagementService {
 async addLike(userId, postId) {
   return neo4jService.addLike(userId, postId);
 }

 async removeLike(userId, postId) {
   return neo4jService.removeLike(userId, postId);
 }

 async addComment(userId, postId, content) {
   return neo4jService.addComment(userId, postId, content);
 }

 async addReply(userId, commentId, content) {
   return neo4jService.addReply(userId, commentId, content);
 }

 async sharePost(userId, postId) {
   return neo4jService.addShare(userId, postId);
 }

 async savePost(userId, postId) {
   return neo4jService.savePost(userId, postId);
 }
}

module.exports = new EngagementService();
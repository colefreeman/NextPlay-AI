// resolvers/post.resolver.js
const postService = require('../services/post.service');

const postResolvers = {
 Query: {
   post: async (_, { id }) => {
     return postService.getPost(id);
   },
   userPosts: async (_, { userId, filter }) => {
     return postService.getUserPosts(userId, filter);
   },
   teamPosts: async (_, { teamId, filter }) => {
     return postService.getTeamPosts(teamId, filter);
   }
 },

 Mutation: {
   createPost: async (_, { input }, { user }) => {
     return postService.createPost(input, user.id);
   },
   updatePost: async (_, { id, input }, { user }) => {
     return postService.updatePost(id, input, user.id);
   },
   deletePost: async (_, { id }, { user }) => {
     return postService.deletePost(id, user.id);
   },
   updatePostSettings: async (_, { postId, settings }, { user }) => {
     return postService.updateSettings(postId, settings, user.id);
   }
 }
};

module.exports = postResolvers;

// resolvers/engagement.resolver.js
const engagementService = require('../services/engagement.service');

const engagementResolvers = {
 Mutation: {
   engagePost: async (_, { postId, action }, { user }) => {
     switch (action) {
       case 'LIKE':
         return engagementService.addLike(user.id, postId);
       case 'UNLIKE':
         return engagementService.removeLike(user.id, postId);
       case 'SAVE':
         return engagementService.savePost(user.id, postId);
       case 'UNSAVE':
         return engagementService.unsavePost(user.id, postId);
       case 'SHARE':
         return engagementService.sharePost(user.id, postId);
       default:
         throw new Error(`Unsupported engagement action: ${action}`);
     }
   },
   addComment: async (_, { postId, content }, { user }) => {
     return engagementService.addComment(user.id, postId, content);
   },
   addReply: async (_, { commentId, content }, { user }) => {
     return engagementService.addReply(user.id, commentId, content);
   }
 }
};

module.exports = engagementResolvers;

// resolvers/feed.resolver.js
const feedService = require('../services/feed.service');

const feedResolvers = {
 Query: {
   feed: async (_, { filter, pagination }, { user }) => {
     return feedService.getFeed(filter, pagination);
   },
   trending: async (_, { category }) => {
     return feedService.getTrendingPosts(category);
   }
 },

 Post: {
   metrics: async (post) => ({
     viewCount: post.viewCount || 0,
     likeCount: post.likeCount || 0,
     commentCount: post.commentCount || 0,
     shareCount: post.shareCount || 0,
     saveCount: post.saveCount || 0,
     impressionCount: post.impressionCount || 0,
     engagementRate: post.engagementRate || 0
   }),
   engagement: async (post) => ({
     likes: post.likes || [],
     comments: post.comments || [],
     shares: post.shares || [],
     saves: post.saves || []
   })
 }
};

module.exports = feedResolvers;
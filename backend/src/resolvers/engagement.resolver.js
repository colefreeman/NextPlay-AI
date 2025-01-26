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
 },

 Like: {
   user: async (like, _, { dataSources }) => {
     return dataSources.userService.getUser(like.userId);
   }
 },

 Comment: {
   user: async (comment, _, { dataSources }) => {
     return dataSources.userService.getUser(comment.userId);
   },
   replies: async (comment) => {
     return engagementService.getReplies(comment.id);
   }
 }
};

module.exports = engagementResolvers;

// resolvers/feed.resolver.js
const feedService = require('../services/feed.service');

const feedResolvers = {
 Query: {
   feed: async (_, { filter, pagination }, { user }) => {
     const posts = await feedService.getFeed(filter, pagination);
     const hasNextPage = posts.length > pagination.limit;
     const nodes = hasNextPage ? posts.slice(0, -1) : posts;
     
     return {
       posts: nodes,
       pageInfo: {
         hasNextPage,
         endCursor: hasNextPage ? 
           Buffer.from((pagination.skip + pagination.limit).toString()).toString('base64') : 
           null
       }
     };
   },

   trending: async (_, { category }) => {
     return feedService.getTrendingPosts(category);
   },

   userPosts: async (_, { userId, filter }) => {
     return feedService.getUserFeed(userId, filter);
   },

   teamPosts: async (_, { teamId, filter }) => {
     return feedService.getTeamFeed(teamId, filter);
   }
 },

 Post: {
   author: async (post, _, { dataSources }) => {
     return dataSources.userService.getUser(post.authorId);
   },
   
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
     likes: await feedService.getPostLikes(post.id),
     comments: await feedService.getPostComments(post.id),
     shares: await feedService.getPostShares(post.id),
     saves: await feedService.getPostSaves(post.id)
   }),

   professional: async (post) => {
     return feedService.getPostProfessionalContent(post.id);
   },

   social: async (post) => {
     return feedService.getPostSocialFeatures(post.id);
   }
 }
};

module.exports = feedResolvers;
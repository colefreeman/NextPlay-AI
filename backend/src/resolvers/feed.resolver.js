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
         endCursor: hasNextPage ? Buffer.from((pagination.skip + pagination.limit).toString()).toString('base64') : null
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
   author: async (post) => {
     return feedService.getPostAuthor(post.id);
   },

   content: async (post) => {
     return feedService.getPostContent(post.id);
   },

   metrics: async (post) => ({
     viewCount: post.viewCount || 0,
     likeCount: post.likeCount || 0,
     commentCount: post.commentCount || 0,
     shareCount: post.shareCount || 0,
     saveCount: post.saveCount || 0,
     impressionCount: post.impressionCount || 0,
     engagementRate: calculateEngagementRate(post)
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

const calculateEngagementRate = (post) => {
 const totalEngagements = post.likeCount + post.commentCount + post.shareCount + post.saveCount;
 return post.impressionCount > 0 ? (totalEngagements / post.impressionCount) * 100 : 0;
};

module.exports = feedResolvers;
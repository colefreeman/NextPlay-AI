// resolvers/feed.resolver.js
const feedService = require('../services/feed.service');

const feedResolvers = {
  Query: {
    feed: async (_, { filter, pagination }, { user }) => {
      console.log('Feed resolver called with:', { filter, pagination, user });
      try {
        // Ensure pagination has integer values
        const sanitizedPagination = {
          limit: Math.floor(Number(pagination?.limit)) || 10,
          cursor: pagination?.cursor
        };

        // Calculate skip from cursor
        const skip = pagination?.cursor ? 
          parseInt(Buffer.from(pagination.cursor, 'base64').toString()) : 0;

        const posts = await feedService.getFeed(filter, sanitizedPagination);
        console.log('Feed resolver result:', posts);
        
        const hasNextPage = posts.length > sanitizedPagination.limit;
        const nodes = hasNextPage ? posts.slice(0, -1) : posts;
        
        return {
          posts: nodes,
          pageInfo: {
            hasNextPage,
            endCursor: hasNextPage ? 
              Buffer.from((skip + sanitizedPagination.limit).toString()).toString('base64') : 
              null
          }
        };
      } catch (error) {
        console.error('Feed resolver error:', error);
        throw error;
      }
    },

    trending: async (_, { category }) => {
      return feedService.getTrendingPosts(category);
    },

    userPosts: async (_, { userId, filter, pagination }) => {
      const sanitizedPagination = {
        limit: Math.floor(Number(pagination?.limit)) || 10,
        cursor: pagination?.cursor
      };
      return feedService.getUserFeed(userId, filter, sanitizedPagination);
    },

    teamPosts: async (_, { teamId, filter, pagination }) => {
      const sanitizedPagination = {
        limit: Math.floor(Number(pagination?.limit)) || 10,
        cursor: pagination?.cursor
      };
      return feedService.getTeamFeed(teamId, filter, sanitizedPagination);
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
      viewCount: Math.floor(Number(post.viewCount)) || 0,
      likeCount: Math.floor(Number(post.likeCount)) || 0,
      commentCount: Math.floor(Number(post.commentCount)) || 0,
      shareCount: Math.floor(Number(post.shareCount)) || 0,
      saveCount: Math.floor(Number(post.saveCount)) || 0,
      impressionCount: Math.floor(Number(post.impressionCount)) || 0,
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
  const totalEngagements = Math.floor(Number(post.likeCount || 0)) + 
                          Math.floor(Number(post.commentCount || 0)) + 
                          Math.floor(Number(post.shareCount || 0)) + 
                          Math.floor(Number(post.saveCount || 0));
  const impressions = Math.floor(Number(post.impressionCount || 0));
  return impressions > 0 ? (totalEngagements / impressions) * 100 : 0;
};

module.exports = feedResolvers;
// utils/validators.js
const validatePostInput = (input) => {
    const errors = [];
   
    if (!input.type) errors.push('Post type is required');
    if (!input.visibility) errors.push('Visibility is required');
    if (!input.content) errors.push('Content is required');
   
    if (input.content) {
      if (!input.content.text && !input.content.mediaUrls?.length) {
        errors.push('Post must contain either text or media');
      }
      if (input.content.text && input.content.text.length > 5000) {
        errors.push('Text content cannot exceed 5000 characters');
      }
      if (input.content.mediaUrls?.length > 10) {
        errors.push('Cannot upload more than 10 media items');
      }
    }
   
    return {
      isValid: errors.length === 0,
      errors
    };
   };
   
   const validateEngagement = (action, userId, postId) => {
    const errors = [];
    const validActions = ['LIKE', 'UNLIKE', 'SAVE', 'UNSAVE', 'SHARE'];
   
    if (!validActions.includes(action)) {
      errors.push(`Invalid action: ${action}`);
    }
    if (!userId) errors.push('User ID is required');
    if (!postId) errors.push('Post ID is required');
   
    return {
      isValid: errors.length === 0,
      errors
    };
   };
   
   const validateFeedFilter = (filter) => {
    const errors = [];
    const validVisibility = ['PUBLIC', 'TEAM', 'CONNECTIONS', 'PRIVATE'];
    const validTypes = ['TEXT', 'IMAGE', 'VIDEO', 'ARTICLE', 'DOCUMENT'];
   
    if (filter.visibility?.some(v => !validVisibility.includes(v))) {
      errors.push('Invalid visibility value');
    }
    if (filter.types?.some(t => !validTypes.includes(t))) {
      errors.push('Invalid post type');
    }
   
    return {
      isValid: errors.length === 0,
      errors
    };
   };
   
   module.exports = {
    validatePostInput,
    validateEngagement,
    validateFeedFilter
   };
   
   // utils/feed-algorithms.js
   const calculateEngagementScore = (post) => {
    const likeWeight = 1;
    const commentWeight = 2;
    const shareWeight = 3;
    const saveWeight = 2;
   
    return (
      post.likeCount * likeWeight +
      post.commentCount * commentWeight +
      post.shareCount * shareWeight +
      post.saveCount * saveWeight
    );
   };
   
   const calculateTimeDecay = (postDate) => {
    const hours = Math.abs(new Date() - new Date(postDate)) / 36e5;
    return 1 / (1 + Math.log(hours + 1));
   };
   
   const rankPosts = (posts) => {
    return posts
      .map(post => ({
        ...post,
        score: calculateEngagementScore(post) * calculateTimeDecay(post.createdAt)
      }))
      .sort((a, b) => b.score - a.score);
   };
   
   const personalizeScores = (posts, userInterests, userConnections) => {
    return posts.map(post => {
      let score = post.score;
      
      // Boost posts from connections
      if (userConnections.includes(post.authorId)) {
        score *= 1.2;
      }
      
      // Boost posts matching interests
      const postTags = [
        ...(post.professional?.industryTags || []),
        ...(post.professional?.skillTags || [])
      ];
      
      const interestMatch = postTags.filter(tag => 
        userInterests.includes(tag)
      ).length;
      
      if (interestMatch > 0) {
        score *= (1 + (interestMatch * 0.1));
      }
      
      return { ...post, score };
    });
   };
   
   module.exports = {
    calculateEngagementScore,
    calculateTimeDecay,
    rankPosts,
    personalizeScores
   };
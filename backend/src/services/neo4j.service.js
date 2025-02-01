// services/neo4j.service.js
const { driver } = require('../config/neo4j-driver');

class Neo4jService {
  // Post CRUD Operations
  async createPost(input, userId) {
    const session = driver.session();
    try {
      const result = await session.run(`
        MATCH (author:User {id: $userId})
        CREATE (p:Post {
          id: randomUUID(),
          type: $type,
          visibility: $visibility,
          createdAt: datetime(),
          updatedAt: datetime(),
          viewCount: 0,
          likeCount: 0,
          commentCount: 0,
          shareCount: 0,
          saveCount: 0,
          impressionCount: 0,
          allowComments: true,
          allowShares: true,
          allowReactions: true,
          isPinned: false,
          isFeatured: false
        })

        CREATE (content:PostContent {
          id: randomUUID(),
          text: $content.text,
          hashtags: $content.hashtags,
          mediaUrls: $content.mediaUrls,
          title: $content.title,
          externalLink: $content.externalLink,
          documentUrl: $content.documentUrl
        })

        CREATE (prof:ProfessionalContent {
          id: randomUUID(),
          role: $content.role,
          isOriginalContent: true,
          sourceAttribution: $content.sourceAttribution,
          category: $category,
          industryTags: $content.industryTags,
          skillTags: $content.skillTags,
          projectTags: $content.projectTags
        })

        CREATE (social:SocialFeatures {
          id: randomUUID(),
          filterInfo: null,
          isFeatured: false,
          isHighlight: false,
          storyExpiration: null
        })

        CREATE (p)-[:HAS_CONTENT]->(content)
        CREATE (p)-[:HAS_PROFESSIONAL_CONTENT]->(prof)
        CREATE (p)-[:HAS_SOCIAL_FEATURES]->(social)
        CREATE (author)-[:AUTHORED]->(p)

        RETURN p, author, content, prof, social
      `, {
        userId,
        type: input.type,
        visibility: input.visibility,
        content: input.content,
        category: input.category
      });

      return result.records[0];
    } finally {
      await session.close();
    }
  }

  // Engagement methods
  async addLike(userId, postId) {
    const session = driver.session();
    try {
      return await session.run(`
        MATCH (u:User {id: $userId}), (p:Post {id: $postId})
        CREATE (like:Like {
          id: randomUUID(),
          createdAt: datetime()
        })
        CREATE (u)-[:CREATED]->(like)-[:ON]->(p)
        SET p.likeCount = p.likeCount + 1
        RETURN p, like
      `, { userId, postId });
    } finally {
      await session.close();
    }
  }

  async removeLike(userId, postId) {
    const session = driver.session();
    try {
      return await session.run(`
        MATCH (u:User {id: $userId})-[:CREATED]->(like:Like)-[:ON]->(p:Post {id: $postId})
        DELETE like
        SET p.likeCount = p.likeCount - 1
        RETURN p
      `, { userId, postId });
    } finally {
      await session.close();
    }
  }

  async addComment(userId, postId, content) {
    const session = driver.session();
    try {
      return await session.run(`
        MATCH (u:User {id: $userId}), (p:Post {id: $postId})
        CREATE (comment:Comment {
          id: randomUUID(),
          content: $content,
          createdAt: datetime(),
          updatedAt: datetime()
        })
        CREATE (u)-[:CREATED]->(comment)-[:ON]->(p)
        SET p.commentCount = p.commentCount + 1
        RETURN comment, u as author
      `, { userId, postId, content });
    } finally {
      await session.close();
    }
  }

  async addReply(userId, commentId, content) {
    const session = driver.session();
    try {
      return await session.run(`
        MATCH (u:User {id: $userId}), (parentComment:Comment {id: $commentId})
        CREATE (reply:Comment {
          id: randomUUID(),
          content: $content,
          createdAt: datetime(),
          updatedAt: datetime()
        })
        CREATE (u)-[:CREATED]->(reply)-[:REPLY_TO]->(parentComment)
        RETURN reply, u as author
      `, { userId, commentId, content });
    } finally {
      await session.close();
    }
  }

  // Feed Methods
  async getFeed(filter, pagination) {
    const session = driver.session();
    console.log('Neo4j getFeed called with:', { filter, pagination });
    try {
      // Convert limit to integer and ensure it's a valid number
      const limit = Math.floor(Number(pagination?.limit)) || 10;
      const skip = parseInt(Buffer.from(pagination?.cursor || '', 'base64').toString()) || 0;

      console.log('Executing Neo4j query with params:', {
        visibilities: filter.visibility || ['PUBLIC'],
        types: filter.types,
        skip,
        limit
      });

      const result = await session.run(`
        MATCH (post:Post)
        WHERE post.visibility IN $visibilities
        ${filter.types ? 'AND post.type IN $types' : ''}
        
        MATCH (post)-[:HAS_CONTENT]->(content:PostContent)
        MATCH (post)<-[:AUTHORED]-(author:User)
        OPTIONAL MATCH (post)-[:HAS_PROFESSIONAL_CONTENT]->(prof:ProfessionalContent)
        OPTIONAL MATCH (post)-[:HAS_SOCIAL_FEATURES]->(social:SocialFeatures)
        
        WITH post, author, content, prof, social
        ORDER BY post.createdAt DESC
        SKIP toInteger($skip)
        LIMIT toInteger($limit)
        
        OPTIONAL MATCH (post)<-[:ON]-(likes:Like)
        OPTIONAL MATCH (post)<-[:ON]-(comments:Comment)
        OPTIONAL MATCH (post)<-[:ON]-(shares:Share)
        
        RETURN 
          post,
          author,
          content,
          prof,
          social,
          collect(DISTINCT likes) as likes,
          collect(DISTINCT comments) as comments,
          collect(DISTINCT shares) as shares
      `, {
        visibilities: filter.visibility || ['PUBLIC'],
        types: filter.types,
        skip,
        limit
      });

      console.log('Neo4j query result:', result);

// Transform the records to the expected GraphQL format
const transformedRecords = result.records.map(record => {
  const post = record.get('post').properties;
  const author = record.get('author').properties;
  const content = record.get('content').properties;
  const prof = record.get('prof')?.properties;
  const social = record.get('social')?.properties;

  // More robust date conversion
  let createdAtDate;
  try {
    if (post.createdAt && post.createdAt.year) {
      createdAtDate = new Date(
        post.createdAt.year.toNumber(),
        post.createdAt.month.toNumber() - 1,
        post.createdAt.day.toNumber(),
        post.createdAt.hour.toNumber(),
        post.createdAt.minute.toNumber(),
        post.createdAt.second.toNumber()
      );
      
      // Validate the date
      if (isNaN(createdAtDate.getTime())) {
        console.error('Invalid date created:', post.createdAt);
        createdAtDate = new Date(); // Fallback to current date
      }
    } else {
      console.error('Missing createdAt data:', post.createdAt);
      createdAtDate = new Date(); // Fallback to current date
    }
  } catch (error) {
    console.error('Error converting date:', error, post.createdAt);
    createdAtDate = new Date(); // Fallback to current date
  }

  return {
    id: post.id,
    type: post.type,
    visibility: post.visibility,
    createdAt: createdAtDate.toISOString(),
    author: {
      id: author.id,
      name: author.name,
      profile: {
        profilePicture: author.profilePicture || '/default-profile.png'
      }
    },
    content: {
      text: content.text,
      hashtags: content.hashtags || [],
      mediaUrls: content.mediaUrls || [],
      mediaType: content.mediaType,
      thumbnailUrl: content.thumbnailUrl,
      title: content.title
    },
    metrics: {
      likeCount: Math.floor(Number(post.likeCount)) || 0,
      commentCount: Math.floor(Number(post.commentCount)) || 0,
      shareCount: Math.floor(Number(post.shareCount)) || 0
    },
    professional: prof ? {
      category: prof.category
    } : null
  };
});

      console.log('Transformed records:', transformedRecords);
      return transformedRecords;
      
    } catch (error) {
      console.error('Neo4j query error:', error);
      throw error;
    } finally {
      await session.close();
    }
  }

  async getTrendingPosts(category) {
    const session = driver.session();
    try {
      return await session.run(`
        MATCH (post:Post)
        WHERE post.visibility = "PUBLIC"
          AND post.createdAt >= datetime() - duration('P7D')
          ${category ? 'AND post.category = $category' : ''}
        
        WITH post,
             post.likeCount * 1 + 
             post.commentCount * 2 + 
             post.shareCount * 3 as engagement
        
        ORDER BY engagement DESC
        LIMIT 20
        
        MATCH (post)-[:HAS_CONTENT]->(content:PostContent)
        MATCH (post)<-[:AUTHORED]-(author:User)
        
        RETURN post, author, content, engagement
      `, { category });
    } finally {
      await session.close();
    }
  }

  // View Tracking
  async trackView(userId, postId) {
    const session = driver.session();
    try {
      return await session.run(`
        MATCH (u:User {id: $userId}), (p:Post {id: $postId})
        CREATE (view:View {
          id: randomUUID(),
          createdAt: datetime()
        })
        CREATE (u)-[:CREATED]->(view)-[:ON]->(p)
        SET p.viewCount = p.viewCount + 1
        RETURN p
      `, { userId, postId });
    } finally {
      await session.close();
    }
  }

  // Notification Methods
  async createNotification(type, actorId, postId) {
    const session = driver.session();
    try {
      return await session.run(`
        MATCH (actor:User {id: $actorId})
        MATCH (post:Post {id: $postId})<-[:AUTHORED]-(author:User)
        CREATE (n:Notification {
          id: randomUUID(),
          type: $type,
          createdAt: datetime(),
          read: false
        })
        CREATE (actor)-[:TRIGGERED]->(n)-[:FOR]->(author)
        CREATE (n)-[:ABOUT]->(post)
        RETURN n
      `, { type, actorId, postId });
    } finally {
      await session.close();
    }
  }

  async getUserNotifications(userId) {
    const session = driver.session();
    try {
      return await session.run(`
        MATCH (u:User {id: $userId})<-[:FOR]-(n:Notification)<-[:TRIGGERED]-(actor:User)
        OPTIONAL MATCH (n)-[:ABOUT]->(content)
        RETURN n, actor, content
        ORDER BY n.createdAt DESC
        LIMIT 50
      `, { userId });
    } finally {
      await session.close();
    }
  }
// Add these methods to your Neo4jService class before the last closing brace

async getPostAuthor(postId) {
  const session = driver.session();
  try {
    const result = await session.run(`
      MATCH (post:Post {id: $postId})<-[:AUTHORED]-(author:User)
      RETURN author
    `, { postId });
    
    const author = result.records[0]?.get('author')?.properties;
    return author ? {
      id: author.id,
      name: author.name,
      profile: {
        profilePicture: author.profilePicture || '/default-profile.png'
      }
    } : null;
  } finally {
    await session.close();
  }
}

async getPostContent(postId) {
  const session = driver.session();
  try {
    const result = await session.run(`
      MATCH (post:Post {id: $postId})-[:HAS_CONTENT]->(content:PostContent)
      RETURN content
    `, { postId });
    
    const content = result.records[0]?.get('content')?.properties;
    return content ? {
      text: content.text,
      hashtags: content.hashtags || [],
      mediaUrls: content.mediaUrls || [],
      mediaType: content.mediaType,
      thumbnailUrl: content.thumbnailUrl,
      title: content.title
    } : null;
  } finally {
    await session.close();
  }
}

async getPostProfessionalContent(postId) {
  const session = driver.session();
  try {
    const result = await session.run(`
      MATCH (post:Post {id: $postId})-[:HAS_PROFESSIONAL_CONTENT]->(prof:ProfessionalContent)
      RETURN prof
    `, { postId });
    
    const prof = result.records[0]?.get('prof')?.properties;
    return prof ? {
      category: prof.category
    } : null;
  } finally {
    await session.close();
  }
}

async getPostSocialFeatures(postId) {
  const session = driver.session();
  try {
    const result = await session.run(`
      MATCH (post:Post {id: $postId})-[:HAS_SOCIAL_FEATURES]->(social:SocialFeatures)
      RETURN social
    `, { postId });
    
    return result.records[0]?.get('social')?.properties || null;
  } finally {
    await session.close();
  }
}

async getPostLikes(postId) {
  const session = driver.session();
  try {
    const result = await session.run(`
      MATCH (post:Post {id: $postId})<-[:ON]-(like:Like)
      RETURN collect(like) as likes
    `, { postId });
    
    return result.records[0]?.get('likes') || [];
  } finally {
    await session.close();
  }
}

async getPostComments(postId) {
  const session = driver.session();
  try {
    const result = await session.run(`
      MATCH (post:Post {id: $postId})<-[:ON]-(comment:Comment)
      RETURN collect(comment) as comments
    `, { postId });
    
    return result.records[0]?.get('comments') || [];
  } finally {
    await session.close();
  }
}

async getPostShares(postId) {
  const session = driver.session();
  try {
    const result = await session.run(`
      MATCH (post:Post {id: $postId})<-[:ON]-(share:Share)
      RETURN collect(share) as shares
    `, { postId });
    
    return result.records[0]?.get('shares') || [];
  } finally {
    await session.close();
  }
}

async getPostSaves(postId) {
  const session = driver.session();
  try {
    const result = await session.run(`
      MATCH (post:Post {id: $postId})<-[:SAVED]-(save:Save)
      RETURN collect(save) as saves
    `, { postId });
    
    return result.records[0]?.get('saves') || [];
  } finally {
    await session.close();
  }
}
}
module.exports = new Neo4jService();
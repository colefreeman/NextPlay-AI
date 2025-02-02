const { driver } = require('../config/neo4j-driver');

const DEFAULT_POST_SETTINGS = {
  allowComments: true,
  allowShares: true,
  allowReactions: true
};

class Neo4jService {
  // Post CRUD Operations
  async createPost(input, userId) {
    const session = driver.session();
    try {
      console.log('Neo4j createPost - Input:', {
        userId,
        type: input.type,
        visibility: input.visibility,
        content: input.content
      });
  
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
          engagementRate: 0.0,
          clickThroughRate: 0.0,
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
  
        CREATE (p)-[:HAS_CONTENT]->(content)
        CREATE (author)-[:AUTHORED]->(p)
  
        RETURN p, author, content
      `, {
        userId,
        type: input.type,
        visibility: input.visibility,
        content: input.content
      });
  
      console.log('Neo4j createPost - Raw result:', result.records[0]);
  
      const record = result.records[0];
      if (!record) {
        throw new Error('Failed to create post - No record returned');
      }
  
      const post = record.get('p').properties;
      const author = record.get('author').properties;
      const content = record.get('content').properties;
  
      // Transform Neo4j datetime to ISO string
      const createdAtDate = new Date(
        post.createdAt.year.toNumber(),
        post.createdAt.month.toNumber() - 1,
        post.createdAt.day.toNumber(),
        post.createdAt.hour.toNumber(),
        post.createdAt.minute.toNumber(),
        post.createdAt.second.toNumber()
      );
  
      const updatedAtDate = new Date(
        post.updatedAt.year.toNumber(),
        post.updatedAt.month.toNumber() - 1,
        post.updatedAt.day.toNumber(),
        post.updatedAt.hour.toNumber(),
        post.updatedAt.minute.toNumber(),
        post.updatedAt.second.toNumber()
      );
  
      // Return data matching the GraphQL Post type exactly
      const transformedPost = {
        id: post.id,
        type: post.type,
        author: {
          id: author.id,
          name: author.name,
          email: author.email,
          role: author.role,
          profile: {
            profilePicture: author.profilePicture || '/default-avatar.png'
          }
        },
        content: {
          text: content.text || '',
          hashtags: content.hashtags || [],
          mediaUrls: content.mediaUrls || [],
          mediaType: null,
          mediaAspectRatio: null,
          thumbnailUrl: null,
          altText: null,
          title: content.title || null,
          externalLink: content.externalLink || null,
          documentUrl: content.documentUrl || null
        },
        visibility: post.visibility,
        createdAt: createdAtDate.toISOString(),
        updatedAt: updatedAtDate.toISOString(),
        metrics: {
          viewCount: parseInt(post.viewCount) || 0,
          likeCount: parseInt(post.likeCount) || 0,
          commentCount: parseInt(post.commentCount) || 0,
          shareCount: parseInt(post.shareCount) || 0,
          saveCount: parseInt(post.saveCount) || 0,
          impressionCount: parseInt(post.impressionCount) || 0,
          clickThroughRate: post.clickThroughRate || 0,
          engagementRate: post.engagementRate || 0
        },
        engagement: {
          likes: [],
          comments: [],
          shares: [],
          saves: []
        },
        professional: null,
        social: null,
        settings: {
          allowComments: post.allowComments !== false,
          allowShares: post.allowShares !== false,
          allowReactions: post.allowReactions !== false,
          isPinned: post.isPinned || false,
          isFeatured: post.isFeatured || false
        }
      };
  
      console.log('Neo4j createPost - Transformed result:', transformedPost);
      return transformedPost;
  
    } catch (error) {
      console.error('Neo4j createPost - Error:', error.message);
      console.error('Stack trace:', error.stack);
      throw error;
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
  
    // Feed Methods
    async getFeed(filter, pagination) {
      const session = driver.session();
      console.log('Neo4j getFeed called with:', { filter, pagination });
      try {
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
          
          WITH post, author, content
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
            collect(DISTINCT likes) as likes,
            collect(DISTINCT comments) as comments,
            collect(DISTINCT shares) as shares
        `, {
          visibilities: filter.visibility || ['PUBLIC'],
          types: filter.types,
          skip,
          limit
        });
        const transformedRecords = result.records.map(record => {
          const post = record.get('post').properties;
          const author = record.get('author').properties;
          const content = record.get('content').properties;
  
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
              
              if (isNaN(createdAtDate.getTime())) {
                console.error('Invalid date created:', post.createdAt);
                createdAtDate = new Date();
              }
            } else {
              console.error('Missing createdAt data:', post.createdAt);
              createdAtDate = new Date();
            }
          } catch (error) {
            console.error('Error converting date:', error, post.createdAt);
            createdAtDate = new Date();
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
            settings: {
              allowComments: post.allowComments !== false,
              allowShares: post.allowShares !== false,
              allowReactions: post.allowReactions !== false
            },
            metrics: {
              likeCount: Math.floor(Number(post.likeCount)) || 0,
              commentCount: Math.floor(Number(post.commentCount)) || 0,
              shareCount: Math.floor(Number(post.shareCount)) || 0
            }
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
    async getPostSettings(postId) {
      const session = driver.session();
      try {
        const result = await session.run(`
          MATCH (post:Post {id: $postId})
          RETURN post
        `, { postId });
        
        const post = result.records[0]?.get('post')?.properties;
        return {
          allowComments: post?.allowComments !== false,
          allowShares: post?.allowShares !== false,
          allowReactions: post?.allowReactions !== false
        };
      } finally {
        await session.close();
      }
    }
  
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
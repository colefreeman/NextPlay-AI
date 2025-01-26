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
   try {
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
       SKIP $skip
       LIMIT $limit
       
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
       skip: parseInt(Buffer.from(pagination.cursor || '', 'base64').toString()) || 0,
       limit: pagination.limit || 10
     });

     return result.records;
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
}

module.exports = new Neo4jService();
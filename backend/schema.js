const { gql } = require('apollo-server-express');

const typeDefs = gql`
  scalar DateTime

  # Existing User and Profile types
  type User {
    id: ID!
    name: String!
    email: String!
    password: String
    googleId: String
    instagramId: String
    role: String!
    profile: Profile
    posts: [Post!]  # Added relationship to posts
  }

  type Profile {
    id: ID!
    userId: ID!
    firstName: String
    lastName: String
    bio: String
    location: String
    avatarUrl: String
    joinedDate: String!
    lastActive: String!
    profileUrl: String
    socialLinks: [SocialLink]
    skills: [String]
    interests: [String]
  }

  type SocialLink {
    platform: String!
    url: String!
  }

  # New Post-related types
  type Post {
    id: ID!
    author: User!
    type: PostType!
    content: PostContent!
    visibility: Visibility!
    createdAt: DateTime!
    updatedAt: DateTime!
    metrics: PostMetrics!
    engagement: PostEngagement!
    professional: ProfessionalContent
    social: SocialFeatures
    settings: PostSettings!
  }

  type PostContent {
    text: String
    hashtags: [String!]
    mediaUrls: [String!]
    mediaType: MediaType
    mediaAspectRatio: Float
    thumbnailUrl: String
    altText: String
    title: String
    externalLink: String
    documentUrl: String
  }

  type PostMetrics {
    viewCount: Int!
    likeCount: Int!
    commentCount: Int!
    shareCount: Int!
    saveCount: Int!
    impressionCount: Int!
    clickThroughRate: Float
    engagementRate: Float
  }

  type PostEngagement {
    likes: [Like!]!
    comments: [Comment!]!
    shares: [Share!]!
    saves: [Save!]!
  }

  # Added engagement-related types
  type Like {
    id: ID!
    user: User!
    createdAt: DateTime!
  }

  type Comment {
    id: ID!
    user: User!
    content: String!
    createdAt: DateTime!
    updatedAt: DateTime
  }

  type Share {
    id: ID!
    user: User!
    createdAt: DateTime!
  }

  type Save {
    id: ID!
    user: User!
    createdAt: DateTime!
  }

  type ProfessionalContent {
    role: String
    isOriginalContent: Boolean!
    sourceAttribution: String
    category: ProfessionalCategory!
    industryTags: [String!]
    skillTags: [String!]
    projectTags: [String!]
  }

  type SocialFeatures {
    filterInfo: String
    location: Location
    taggedUsers: [User!]
    taggedTeams: [Team!]
    mentions: [User!]
    isFeatured: Boolean!
    isHighlight: Boolean!
    storyExpiration: DateTime
  }

  # Location and Team types
  type Location {
    id: ID!
    name: String!
    latitude: Float
    longitude: Float
  }

  type Team {
    id: ID!
    name: String!
    logo: String
  }

  type PostSettings {
    allowComments: Boolean!
    allowShares: Boolean!
    allowReactions: Boolean!
    isPinned: Boolean!
    isFeatured: Boolean!
  }

  # Enums
  enum PostType {
    TEXT
    IMAGE
    VIDEO
    ARTICLE
    DOCUMENT
  }

  enum MediaType {
    IMAGE
    VIDEO
    DOCUMENT
  }

  enum Visibility {
    PUBLIC
    TEAM
    CONNECTIONS
    PRIVATE
  }

  enum ProfessionalCategory {
    ACHIEVEMENT
    JOB_UPDATE
    INDUSTRY_NEWS
    TRAINING
    PROJECT_UPDATE
    TEAM_UPDATE
  }

  enum EngagementAction {
    LIKE
    UNLIKE
    SAVE
    UNSAVE
    SHARE
  }

  # Input Types
  input SocialLinkInput {
    platform: String!
    url: String!
  }

  input ProfileUpdateInput {
    firstName: String
    lastName: String
    bio: String
    location: String
    avatarUrl: String
    socialLinks: [SocialLinkInput]
    skills: [String]
    interests: [String]
  }

  input CreatePostInput {
    type: PostType!
    content: PostContentInput!
    visibility: Visibility!
    category: ProfessionalCategory
    teamId: ID
    tags: PostTagsInput
  }

  input PostContentInput {
    text: String
    hashtags: [String!]
    mediaUrls: [String!]
    title: String
    externalLink: String
    documentUrl: String
  }

  input PostTagsInput {
    userIds: [ID!]
    teamIds: [ID!]
  }

  input UpdatePostInput {
    content: PostContentInput
    visibility: Visibility
    settings: PostSettingsInput
  }

  input PostSettingsInput {
    allowComments: Boolean
    allowShares: Boolean
    allowReactions: Boolean
    isPinned: Boolean
    isFeatured: Boolean
  }

  input FeedFilter {
    types: [PostType!]
    categories: [ProfessionalCategory!]
    visibility: [Visibility!]
    authorIds: [ID!]
    teamIds: [ID!]
    dateRange: DateRangeInput
  }

  input PostFilter {
    types: [PostType!]
    categories: [ProfessionalCategory!]
    dateRange: DateRangeInput
  }

  input DateRangeInput {
    start: DateTime
    end: DateTime
  }

  input PaginationInput {
    cursor: String
    limit: Int = 10
  }

  # Response Types
  type FeedResponse {
    posts: [Post!]!
    pageInfo: PageInfo!
  }

  type PageInfo {
    hasNextPage: Boolean!
    endCursor: String
  }

  type EngagementResponse {
    success: Boolean!
    post: Post!
  }

  # Query and Mutation types
  type Query {
    # Existing queries
    login(email: String!, password: String!): String
    getProfile(username: String!): Profile
    getCurrentUserProfile: Profile

    # Post queries
    feed(filter: FeedFilter, pagination: PaginationInput): FeedResponse!
    post(id: ID!): Post
    userPosts(userId: ID!, filter: PostFilter): [Post!]!
    teamPosts(teamId: ID!, filter: PostFilter): [Post!]!
    trending(category: ProfessionalCategory): [Post!]!
  }

  type Mutation {
    # Existing mutations
    registerUser(name: String!, email: String!, password: String!, role: String!): User
    linkGoogleAccount(userId: ID!, googleId: String!): User
    linkInstagramAccount(userId: ID!, instagramId: String!): User
    updateProfile(input: ProfileUpdateInput!): Profile
    updateLastActive: Profile

    # Post mutations
    createPost(input: CreatePostInput!): Post!
    updatePost(id: ID!, input: UpdatePostInput!): Post!
    deletePost(id: ID!): Boolean!
    engagePost(postId: ID!, action: EngagementAction!): EngagementResponse!
    updatePostSettings(postId: ID!, settings: PostSettingsInput!): Post!
  }
`;

module.exports = typeDefs;
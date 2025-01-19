const { gql } = require('apollo-server-express');

const typeDefs = gql`
  # User node
  type User {
    id: ID!
    name: String! # Full name of the user
    email: String! # Email address for authentication
    password: String # Hashed password for traditional login
    googleId: String # OAuth ID for Google login
    instagramId: String # OAuth ID for Instagram login
    role: String! # Role in the app: coach, player, analyst
    # Added Profile Fields
    profile: Profile # Link to user's profile
  }

  # Profile type for user profile information
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

  # Social Link type for profile
  type SocialLink {
    platform: String!
    url: String!
  }

  # Input type for social links
  input SocialLinkInput {
    platform: String!
    url: String!
  }

  # Input type for profile updates
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

  # Queries to fetch data
  type Query {
    # Existing queries
    login(email: String!, password: String!): String

    # Added Profile Queries
    getProfile(username: String!): Profile
    getCurrentUserProfile: Profile
  }

  # Mutations to modify data
  type Mutation {
    # Existing mutations
    registerUser(name: String!, email: String!, password: String!, role: String!): User
    linkGoogleAccount(userId: ID!, googleId: String!): User
    linkInstagramAccount(userId: ID!, instagramId: String!): User

    # Added Profile Mutations
    updateProfile(input: ProfileUpdateInput!): Profile
    updateLastActive: Profile
  }
`;

module.exports = typeDefs;
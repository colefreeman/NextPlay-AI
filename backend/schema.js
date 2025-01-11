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
  }

  # Queries to fetch data
  type Query {
    # Log in a user (traditional email/password)
    login(email: String!, password: String!): String
  }

  # Mutations to modify data
  type Mutation {
    # Register a new user with traditional login
    registerUser(name: String!, email: String!, password: String!, role: String!): User

    # Link Google account to an existing user
    linkGoogleAccount(userId: ID!, googleId: String!): User

    # Link Instagram account to an existing user
    linkInstagramAccount(userId: ID!, instagramId: String!): User
  }
`;

module.exports = typeDefs;
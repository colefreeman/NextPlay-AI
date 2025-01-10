const { gql } = require('apollo-server-express');

const typeDefs = gql`
  type User {
    id: ID!
    username: String!
    email: String
    password: String
    googleId: String
    instagramId: String
  }

  type Query {
    login(email: String!, password: String!): String
  }

  type Mutation {
    registerUser(username: String!, email: String!, password: String!): User
  }
`;

module.exports = typeDefs;
/**
 * GraphQL Type Definitions
 *
 * This file contains the GraphQL schema definition for DITS.
 * Currently includes basic User and Auth types with room for expansion.
 */
export const typeDefs = `#graphql
  # Scalar types
  scalar DateTime
  scalar JSON

  # User type
  type User {
    id: ID!
    email: String!
    username: String!
    firstName: String
    lastName: String
    avatar: String
    isEmailVerified: Boolean!
    createdAt: DateTime!
    updatedAt: DateTime!
    preferences: JSON
  }

  # Authentication types
  type AuthPayload {
    user: User!
    accessToken: String!
    refreshToken: String!
  }

  type RefreshTokenPayload {
    accessToken: String!
    refreshToken: String!
  }

  # Response types
  type SuccessResponse {
    success: Boolean!
    message: String!
  }

  # Queries
  type Query {
    # Auth queries
    me: User
    
    # Health check
    health: HealthCheck!
  }

  # Mutations
  type Mutation {
    # Authentication mutations
    register(
      email: String!
      password: String!
      username: String!
      firstName: String
      lastName: String
    ): AuthPayload!
    
    login(
      email: String!
      password: String!
    ): AuthPayload!
    
    refreshToken(
      refreshToken: String!
    ): RefreshTokenPayload!
    
    logout: SuccessResponse!
    
    requestPasswordReset(
      email: String!
    ): SuccessResponse!
    
    resetPassword(
      token: String!
      newPassword: String!
    ): SuccessResponse!
    
    verifyEmail(
      token: String!
    ): SuccessResponse!
    
    resendVerificationEmail: SuccessResponse!
  }

  # Health check type
  type HealthCheck {
    status: String!
    timestamp: DateTime!
    uptime: Float!
    environment: String!
  }
`;

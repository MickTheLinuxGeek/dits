import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { ApolloServerPluginLandingPageLocalDefault } from '@apollo/server/plugin/landingPage/default';
import { Application } from 'express';
import express from 'express';
import cors from 'cors';
import { typeDefs } from './typeDefs';
import { resolvers, GraphQLContext } from './resolvers';
import { config } from '../config/env';

/**
 * Creates and configures Apollo Server
 */
export const createApolloServer = () => {
  return new ApolloServer<GraphQLContext>({
    typeDefs,
    resolvers,
    introspection: config.app.env !== 'production',
    plugins:
      config.app.env === 'development'
        ? [ApolloServerPluginLandingPageLocalDefault()]
        : [],
    formatError: (formattedError, error) => {
      // Log errors in development
      if (config.app.env === 'development') {
        console.error('GraphQL Error:', error);
      }

      // Don't expose internal errors in production
      if (config.app.env === 'production' && !formattedError.extensions?.code) {
        return {
          message: 'Internal server error',
          extensions: {
            code: 'INTERNAL_SERVER_ERROR',
          },
        };
      }

      return formattedError;
    },
  });
};

/**
 * Context factory for GraphQL requests
 */
export const createGraphQLContext = async ({
  req,
  res,
}: {
  req: any;

  res: any;
}): Promise<GraphQLContext> => {
  // TODO: Extract user from JWT token in Authorization header
  // For now, return empty context
  return {
    req,
    res,
    user: undefined,
  };
};

/**
 * Applies GraphQL middleware to Express app
 */
export const applyGraphQLMiddleware = async (app: Application) => {
  const apolloServer = createApolloServer();

  // Start Apollo Server
  await apolloServer.start();

  // Apply GraphQL middleware to /graphql endpoint
  app.use(
    '/graphql',
    cors<cors.CorsRequest>({
      origin: config.cors.origin,
      credentials: config.cors.credentials,
    }),
    express.json(),
    // Initialize req.body for GET requests (needed by Apollo landing page)
    (req, _res, next) => {
      if (!req.body) {
        req.body = {};
      }
      next();
    },
    expressMiddleware(apolloServer, {
      context: createGraphQLContext,
    }) as any, // Type workaround for express version mismatch
  );

  console.log(`GraphQL endpoint available at /graphql`);
};

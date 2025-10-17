import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import { config } from './config/env';
import { errorHandler } from './middleware/errorHandler';
import { notFoundHandler } from './middleware/notFoundHandler';
import { applyGraphQLMiddleware } from './graphql/server';
import { applySwaggerMiddleware } from './docs/swagger';
import apiRoutes from './routes/index';

/**
 * Creates and configures the Express application
 */
export const createApp = async (): Promise<Application> => {
  const app = express();

  // Security middleware - must be first
  app.use(
    helmet({
      contentSecurityPolicy:
        config.app.env === 'production'
          ? {
              directives: {
                defaultSrc: ["'self'"],
                styleSrc: ["'self'", "'unsafe-inline'"],
                scriptSrc: ["'self'"],
                imgSrc: ["'self'", 'data:', 'https:'],
              },
            }
          : false, // Disable CSP in development for GraphQL Playground
      crossOriginEmbedderPolicy: false,
    }),
  );

  // CORS configuration
  app.use(
    cors({
      origin: config.cors.origin,
      credentials: config.cors.credentials,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
      exposedHeaders: ['X-Total-Count', 'X-Page-Count'],
      maxAge: 86400, // 24 hours
    }),
  );

  // Body parsing middleware
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Cookie parsing
  app.use(cookieParser(config.session.secret));

  // Compression middleware
  app.use(compression());

  // Logging middleware
  if (config.app.env === 'development') {
    app.use(morgan('dev'));
  } else {
    app.use(morgan('combined'));
  }

  // Health check endpoint
  app.get('/health', (_req, res) => {
    res.status(200).json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: config.app.env,
    });
  });

  // API documentation (Swagger)
  if (config.app.env === 'development' || config.development.enableApiDocs) {
    applySwaggerMiddleware(app);
  }

  // GraphQL endpoint (without version prefix)
  await applyGraphQLMiddleware(app);

  // API routes (all versions)
  app.use('/api', apiRoutes);

  // 404 handler - must be after all routes
  app.use(notFoundHandler);

  // Error handling middleware - must be last
  app.use(errorHandler);

  return app;
};

import { createApp } from './app';
import { config, validateConfig } from './config/env';
import { connectDatabase } from './database/prisma';
import { connectRedis } from './database/redis';

/**
 * Main server startup function
 */
async function startServer() {
  try {
    // Validate configuration
    console.log('Validating configuration...');
    validateConfig();

    // Connect to database
    console.log('Connecting to PostgreSQL database...');
    await connectDatabase();

    // Connect to Redis
    console.log('Connecting to Redis...');
    await connectRedis();

    // Create Express app
    console.log('Creating Express application...');
    const app = await createApp();

    // Start server
    const port = config.app.port;
    app.listen(port, () => {
      console.log(`\n🚀 Server started successfully!`);
      console.log(`Environment: ${config.app.env}`);
      console.log(`Server URL: ${config.app.url}`);
      console.log(`GraphQL Playground: ${config.app.url}/graphql`);
      if (
        config.app.env === 'development' ||
        config.development.enableApiDocs
      ) {
        console.log(`API Documentation: ${config.app.url}/api/docs`);
      }
      console.log('\nPress CTRL-C to stop\n');
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Handle SIGTERM
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  process.exit(0);
});

// Handle SIGINT (Ctrl+C)
process.on('SIGINT', () => {
  console.log('\nSIGINT signal received: closing HTTP server');
  process.exit(0);
});

// Start the server
startServer();

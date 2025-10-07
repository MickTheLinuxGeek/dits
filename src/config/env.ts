import dotenv from 'dotenv';
import { resolve } from 'path';

// Load environment variables from .env file
dotenv.config({ path: resolve(__dirname, '../../.env') });

/**
 * Application configuration loaded from environment variables
 */
export const config = {
  // Application
  app: {
    env: process.env.NODE_ENV || 'development',
    port: parseInt(process.env.PORT || '3000', 10),
    url: process.env.APP_URL || 'http://localhost:3000',
  },

  // Database
  database: {
    host: process.env.DATABASE_HOST || 'localhost',
    port: parseInt(process.env.DATABASE_PORT || '5432', 10),
    name: process.env.DATABASE_NAME || 'dits_dev',
    user: process.env.DATABASE_USER || 'dits_user',
    password: process.env.DATABASE_PASSWORD || 'dits_password',
    url:
      process.env.DATABASE_URL ||
      `postgresql://${process.env.DATABASE_USER}:${process.env.DATABASE_PASSWORD}@${process.env.DATABASE_HOST}:${process.env.DATABASE_PORT}/${process.env.DATABASE_NAME}`,
    pool: {
      min: parseInt(process.env.DATABASE_POOL_MIN || '2', 10),
      max: parseInt(process.env.DATABASE_POOL_MAX || '10', 10),
    },
  },

  // Test Database
  testDatabase: {
    name: process.env.TEST_DATABASE_NAME || 'dits_test',
    url:
      process.env.TEST_DATABASE_URL ||
      `postgresql://${process.env.DATABASE_USER}:${process.env.DATABASE_PASSWORD}@${process.env.DATABASE_HOST}:${process.env.DATABASE_PORT}/${process.env.TEST_DATABASE_NAME}`,
  },

  // Redis
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    password: process.env.REDIS_PASSWORD || undefined,
    url: process.env.REDIS_URL || 'redis://localhost:6379',
  },

  // Session
  session: {
    secret: process.env.SESSION_SECRET || 'dev-session-secret',
    timeout: parseInt(process.env.SESSION_TIMEOUT || '604800000', 10),
  },

  // JWT Authentication
  jwt: {
    secret: process.env.JWT_SECRET || 'dev-jwt-secret',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'dev-jwt-refresh-secret',
    expiresIn: process.env.JWT_EXPIRES_IN || '15m',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  },

  // Password Hashing
  bcrypt: {
    rounds: parseInt(process.env.BCRYPT_ROUNDS || '12', 10),
  },

  // Email
  email: {
    provider: process.env.EMAIL_PROVIDER || 'smtp',
    smtp: {
      host: process.env.SMTP_HOST || 'smtp.example.com',
      port: parseInt(process.env.SMTP_PORT || '587', 10),
      secure: process.env.SMTP_SECURE === 'true',
      user: process.env.SMTP_USER || '',
      password: process.env.SMTP_PASSWORD || '',
    },
    from: process.env.EMAIL_FROM || 'noreply@dits.dev',
  },

  // Git Provider OAuth
  github: {
    clientId: process.env.GITHUB_CLIENT_ID || '',
    clientSecret: process.env.GITHUB_CLIENT_SECRET || '',
    callbackUrl:
      process.env.GITHUB_CALLBACK_URL ||
      'http://localhost:3000/auth/github/callback',
  },

  gitlab: {
    clientId: process.env.GITLAB_CLIENT_ID || '',
    clientSecret: process.env.GITLAB_CLIENT_SECRET || '',
    callbackUrl:
      process.env.GITLAB_CALLBACK_URL ||
      'http://localhost:3000/auth/gitlab/callback',
  },

  bitbucket: {
    clientId: process.env.BITBUCKET_CLIENT_ID || '',
    clientSecret: process.env.BITBUCKET_CLIENT_SECRET || '',
    callbackUrl:
      process.env.BITBUCKET_CALLBACK_URL ||
      'http://localhost:3000/auth/bitbucket/callback',
  },

  // Encryption
  encryption: {
    key: process.env.ENCRYPTION_KEY || 'dev-encryption-key-32-chars-long',
  },

  // Elasticsearch
  elasticsearch: {
    node: process.env.ELASTICSEARCH_NODE || 'http://localhost:9200',
    username: process.env.ELASTICSEARCH_USERNAME || '',
    password: process.env.ELASTICSEARCH_PASSWORD || '',
    indexPrefix: process.env.ELASTICSEARCH_INDEX_PREFIX || 'dits',
  },

  // Rate Limiting
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10),
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),
  },

  // CORS
  cors: {
    origin: process.env.CORS_ORIGIN?.split(',') || [
      'http://localhost:5173',
      'http://localhost:3000',
    ],
    credentials: process.env.CORS_CREDENTIALS === 'true',
  },

  // Logging
  logging: {
    level: process.env.LOG_LEVEL || 'debug',
    format: process.env.LOG_FORMAT || 'json',
  },

  // File Upload
  upload: {
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '10485760', 10),
    uploadDir: process.env.UPLOAD_DIR || './uploads',
  },

  // WebSocket
  websocket: {
    port: parseInt(process.env.WS_PORT || '3001', 10),
    path: process.env.WS_PATH || '/ws',
  },

  // Monitoring
  monitoring: {
    datadog: {
      apiKey: process.env.DATADOG_API_KEY || '',
      appKey: process.env.DATADOG_APP_KEY || '',
      env: process.env.DATADOG_ENV || 'development',
    },
    sentry: {
      dsn: process.env.SENTRY_DSN || '',
    },
  },

  // Feature Flags
  features: {
    gitIntegration: process.env.FEATURE_GIT_INTEGRATION === 'true',
    webhooks: process.env.FEATURE_WEBHOOKS === 'true',
    analytics: process.env.FEATURE_ANALYTICS === 'true',
  },

  // Development
  development: {
    debug: process.env.DEBUG || '',
    hotReload: process.env.HOT_RELOAD === 'true',
    enableApiDocs: process.env.ENABLE_API_DOCS === 'true',
    apiDocsPath: process.env.API_DOCS_PATH || '/api/docs',
  },
};

/**
 * Validates that all required environment variables are set
 * @throws {Error} if required variables are missing
 */
export function validateConfig(): void {
  const requiredVars: string[] = [];

  // Add required variables based on environment
  if (config.app.env === 'production') {
    requiredVars.push(
      'JWT_SECRET',
      'JWT_REFRESH_SECRET',
      'SESSION_SECRET',
      'ENCRYPTION_KEY',
      'DATABASE_URL',
    );
  }

  const missing = requiredVars.filter(
    (varName) => !process.env[varName] || process.env[varName] === '',
  );

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}`,
    );
  }

  // Validate sensitive secrets in production
  if (config.app.env === 'production') {
    const devSecrets = [
      'dev-jwt-secret',
      'dev-jwt-refresh-secret',
      'dev-session-secret',
      'dev-encryption-key',
      'change-this',
    ];

    const insecureSecrets = devSecrets.filter(
      (secret) =>
        config.jwt.secret.includes(secret) ||
        config.jwt.refreshSecret.includes(secret) ||
        config.session.secret.includes(secret) ||
        config.encryption.key.includes(secret),
    );

    if (insecureSecrets.length > 0) {
      throw new Error(
        'Production environment detected with insecure development secrets. Please set proper secret values.',
      );
    }
  }
}

/**
 * Returns true if running in development mode
 */
export function isDevelopment(): boolean {
  return config.app.env === 'development';
}

/**
 * Returns true if running in production mode
 */
export function isProduction(): boolean {
  return config.app.env === 'production';
}

/**
 * Returns true if running in test mode
 */
export function isTest(): boolean {
  return config.app.env === 'test';
}

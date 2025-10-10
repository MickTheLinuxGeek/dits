import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { Application } from 'express';
import { config } from '../config/env';

/**
 * Swagger/OpenAPI specification
 */
const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'DITS API Documentation',
    version: '1.0.0',
    description:
      'Developer Issue Tracking System (DITS) REST API documentation. ' +
      'This API provides endpoints for managing issues, projects, and user authentication.',
    contact: {
      name: 'DITS Development Team',
      url: 'https://github.com/MickTheLinuxGeek/dits',
    },
    license: {
      name: 'ISC',
      url: 'https://opensource.org/licenses/ISC',
    },
  },
  servers: [
    {
      url: config.app.url,
      description: `${config.app.env} server`,
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'JWT access token for authentication',
      },
      cookieAuth: {
        type: 'apiKey',
        in: 'cookie',
        name: 'refreshToken',
        description: 'Refresh token stored in HTTP-only cookie',
      },
    },
    schemas: {
      Error: {
        type: 'object',
        properties: {
          status: {
            type: 'string',
            enum: ['error', 'fail'],
            example: 'fail',
          },
          message: {
            type: 'string',
            example: 'Validation failed',
          },
          errors: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                field: {
                  type: 'string',
                  example: 'email',
                },
                message: {
                  type: 'string',
                  example: 'Invalid email format',
                },
              },
            },
          },
        },
      },
      User: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            format: 'uuid',
            example: '123e4567-e89b-12d3-a456-426614174000',
          },
          email: {
            type: 'string',
            format: 'email',
            example: 'user@example.com',
          },
          username: {
            type: 'string',
            example: 'johndoe',
          },
          firstName: {
            type: 'string',
            example: 'John',
          },
          lastName: {
            type: 'string',
            example: 'Doe',
          },
          avatar: {
            type: 'string',
            format: 'uri',
            nullable: true,
            example: 'https://example.com/avatar.jpg',
          },
          isEmailVerified: {
            type: 'boolean',
            example: true,
          },
          createdAt: {
            type: 'string',
            format: 'date-time',
            example: '2024-01-01T00:00:00Z',
          },
          updatedAt: {
            type: 'string',
            format: 'date-time',
            example: '2024-01-01T00:00:00Z',
          },
        },
      },
      AuthResponse: {
        type: 'object',
        properties: {
          user: {
            $ref: '#/components/schemas/User',
          },
          accessToken: {
            type: 'string',
            example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
          },
          refreshToken: {
            type: 'string',
            example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
          },
        },
      },
    },
  },
  tags: [
    {
      name: 'Authentication',
      description: 'User authentication and authorization endpoints',
    },
    {
      name: 'Users',
      description: 'User management endpoints',
    },
    {
      name: 'Health',
      description: 'System health and status endpoints',
    },
  ],
};

/**
 * Swagger JSDoc options
 */
const swaggerOptions: swaggerJsdoc.Options = {
  swaggerDefinition,
  apis: ['./src/routes/**/*.ts', './src/controllers/**/*.ts', './src/app.ts'],
};

/**
 * Generate Swagger specification
 */
const swaggerSpec = swaggerJsdoc(swaggerOptions);

/**
 * Applies Swagger UI middleware to Express app
 */
export const applySwaggerMiddleware = (app: Application): void => {
  // Serve Swagger UI
  app.use(
    '/api/docs',
    swaggerUi.serve,
    swaggerUi.setup(swaggerSpec, {
      explorer: true,
      customCss: '.swagger-ui .topbar { display: none }',
      customSiteTitle: 'DITS API Documentation',
    }),
  );

  // Serve raw OpenAPI specification
  app.get('/api/docs.json', (_req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
  });

  console.log('API documentation available at /api/docs');
};

/**
 * Health check endpoint documentation
 *
 * @swagger
 * /health:
 *   get:
 *     summary: Health check
 *     description: Returns the current health status of the API
 *     tags:
 *       - Health
 *     responses:
 *       200:
 *         description: API is healthy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: ok
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                   example: 2024-01-01T00:00:00Z
 *                 uptime:
 *                   type: number
 *                   example: 123.456
 *                 environment:
 *                   type: string
 *                   example: development
 */

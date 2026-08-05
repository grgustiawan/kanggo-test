import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Kanggo Task Management API',
      version: '1.0.0',
      description: 'API documentation for Kanggo Task Management System',
      contact: {
        name: 'API Support',
        email: 'support@kanggo.test'
      }
    },
    servers: [
      {
        url: 'http://localhost:5000',
        description: 'Development server'
      }
    ],
    components: {
      securitySchemes: {
        cookieAuth: {
          type: 'apiKey',
          in: 'cookie',
          name: 'access_token'
        }
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            organizationId: { type: 'integer' },
            email: { type: 'string' },
            name: { type: 'string' },
            status: { type: 'string', enum: ['active', 'inactive', 'suspended', 'deleted'] },
            roles: { type: 'array', items: { type: 'string' } },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        },
        Task: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            organizationId: { type: 'integer' },
            taskNumber: { type: 'string' },
            title: { type: 'string' },
            description: { type: 'string' },
            status: { type: 'string', enum: ['pending', 'in_progress', 'done'] },
            priority: { type: 'string', enum: ['low', 'medium', 'high'] },
            deadline: { type: 'string', format: 'date-time' },
            userId: { type: 'integer' },
            userName: { type: 'string' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        },
        Error: {
          type: 'object',
          properties: {
            error: { type: 'string' },
            message: { type: 'string' }
          }
        }
      }
    },
    security: [
      {
        cookieAuth: []
      }
    ]
  },
  apis: ['./src/presentation/routes/*.ts']
};

export const swaggerSpec = swaggerJsdoc(options);

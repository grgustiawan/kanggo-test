import swaggerJsdoc from 'swagger-jsdoc';

const swaggerDefinition = {
    openapi: '3.0.3',
    info: {
        title: 'KANGGO - Task Management API',
        version: '1.0.0',
        description: 'API documentation for Kanggo Task Management System',
    },
    servers: [
        {
            url: 'http://localhost:5000',
            description: 'Development server',
        },
    ],
    components: {
        securitySchemes: {
            cookieAuth: {
                type: 'apiKey',
                in: 'cookie',
                name: 'access_token',
            },
        },
        schemas: {
            User: {
                type: 'object',
                properties: {
                    id: { type: 'integer' },
                    organizationId: { type: 'integer' },
                    email: { type: 'string', format: 'email' },
                    name: { type: 'string' },
                    status: { type: 'string', enum: ['active', 'inactive', 'suspended', 'deleted'] },
                    isEmailVerified: { type: 'integer' },
                    createdAt: { type: 'string', format: 'date-time' },
                },
            },
            Task: {
                type: 'object',
                properties: {
                    id: { type: 'string', format: 'uuid' },
                    organizationId: { type: 'integer' },
                    taskNumber: { type: 'string' },
                    title: { type: 'string' },
                    description: { type: 'string', nullable: true },
                    status: { type: 'string', enum: ['pending', 'in_progress', 'done'] },
                    priority: { type: 'string', enum: ['low', 'medium', 'high'] },
                    deadline: { type: 'string', format: 'date-time', nullable: true },
                    userId: { type: 'integer' },
                    createdBy: { type: 'integer', nullable: true },
                    updatedBy: { type: 'integer', nullable: true },
                    deletedBy: { type: 'integer', nullable: true },
                    createdAt: { type: 'string', format: 'date-time' },
                    updatedAt: { type: 'string', format: 'date-time' },
                    deletedAt: { type: 'string', format: 'date-time', nullable: true },
                },
            },
            Error: {
                type: 'object',
                properties: {
                    error: { type: 'string' },
                    details: {
                        type: 'array',
                        items: {
                            type: 'object',
                            properties: {
                                path: { type: 'string' },
                                message: { type: 'string' },
                            },
                        },
                    },
                },
            },
        },
    },
    paths: {
        '/api/auth/register': {
            post: {
                tags: ['Authentication'],
                summary: 'Register new user',
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                required: ['name', 'email', 'password'],
                                properties: {
                                    name: { type: 'string', minLength: 1, maxLength: 150 },
                                    email: { type: 'string', format: 'email', maxLength: 190 },
                                    password: { type: 'string', minLength: 8, maxLength: 72 },
                                },
                            },
                        },
                    },
                },
                responses: {
                    '201': {
                        description: 'User registered successfully',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        user: { $ref: '#/components/schemas/User' },
                                    },
                                },
                            },
                        },
                    },
                    '400': {
                        description: 'Validation error',
                        content: {
                            'application/json': {
                                schema: { $ref: '#/components/schemas/Error' },
                            },
                        },
                    },
                    '409': {
                        description: 'Email already registered',
                        content: {
                            'application/json': {
                                schema: { $ref: '#/components/schemas/Error' },
                            },
                        },
                    },
                },
            },
        },
        '/api/auth/login': {
            post: {
                tags: ['Authentication'],
                summary: 'Login user',
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                required: ['email', 'password'],
                                properties: {
                                    email: { type: 'string', format: 'email' },
                                    password: { type: 'string' },
                                },
                            },
                        },
                    },
                },
                responses: {
                    '200': {
                        description: 'Login successful',
                        headers: {
                            'Set-Cookie': {
                                schema: {
                                    type: 'string',
                                    example: 'access_token=...; HttpOnly; Secure; SameSite=Strict',
                                },
                            },
                        },
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        message: { type: 'string' },
                                    },
                                },
                            },
                        },
                    },
                    '401': {
                        description: 'Invalid credentials',
                        content: {
                            'application/json': {
                                schema: { $ref: '#/components/schemas/Error' },
                            },
                        },
                    },
                },
            },
        },
        '/api/auth/logout': {
            post: {
                tags: ['Authentication'],
                summary: 'Logout user',
                security: [{ cookieAuth: [] }],
                responses: {
                    '200': {
                        description: 'Logout successful',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        message: { type: 'string' },
                                    },
                                },
                            },
                        },
                    },
                },
            },
        },
        '/api/tasks': {
            get: {
                tags: ['Tasks'],
                summary: 'List tasks with pagination',
                security: [{ cookieAuth: [] }],
                parameters: [
                    {
                        name: 'status',
                        in: 'query',
                        schema: { type: 'string', enum: ['pending', 'in_progress', 'done'] },
                    },
                    {
                        name: 'search',
                        in: 'query',
                        description: 'Fulltext search query',
                        schema: { type: 'string' },
                    },
                    {
                        name: 'cursor',
                        in: 'query',
                        description: 'Pagination cursor',
                        schema: { type: 'string' },
                    },
                    {
                        name: 'limit',
                        in: 'query',
                        schema: { type: 'integer', minimum: 1, maximum: 100, default: 20 },
                    },
                ],
                responses: {
                    '200': {
                        description: 'Tasks retrieved successfully',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        data: {
                                            type: 'array',
                                            items: { $ref: '#/components/schemas/Task' },
                                        },
                                        nextCursor: { type: 'string', nullable: true },
                                        hasMore: { type: 'boolean' },
                                    },
                                },
                            },
                        },
                    },
                },
            },
            post: {
                tags: ['Tasks'],
                summary: 'Create new task',
                security: [{ cookieAuth: [] }],
                parameters: [
                    {
                        name: 'Idempotency-Key',
                        in: 'header',
                        schema: { type: 'string' },
                    },
                ],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                required: ['title'],
                                properties: {
                                    title: { type: 'string', minLength: 1, maxLength: 500 },
                                    description: { type: 'string' },
                                    priority: { type: 'string', enum: ['low', 'medium', 'high'] },
                                    deadline: { type: 'string', format: 'date-time' },
                                },
                            },
                        },
                    },
                },
                responses: {
                    '201': {
                        description: 'Task created successfully',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        task: { $ref: '#/components/schemas/Task' },
                                    },
                                },
                            },
                        },
                    },
                },
            },
        },
        '/api/tasks/{id}': {
            get: {
                tags: ['Tasks'],
                summary: 'Get task by ID',
                security: [{ cookieAuth: [] }],
                parameters: [
                    {
                        name: 'id',
                        in: 'path',
                        required: true,
                        schema: { type: 'string' },
                    },
                ],
                responses: {
                    '200': {
                        description: 'Task retrieved successfully',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        task: { $ref: '#/components/schemas/Task' },
                                    },
                                },
                            },
                        },
                    },
                    '404': {
                        description: 'Task not found',
                        content: {
                            'application/json': {
                                schema: { $ref: '#/components/schemas/Error' },
                            },
                        },
                    },
                },
            },
            put: {
                tags: ['Tasks'],
                summary: 'Update task',
                security: [{ cookieAuth: [] }],
                parameters: [
                    {
                        name: 'id',
                        in: 'path',
                        required: true,
                        schema: { type: 'string' },
                    },
                    {
                        name: 'Idempotency-Key',
                        in: 'header',
                        schema: { type: 'string' },
                    },
                ],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    title: { type: 'string', minLength: 1, maxLength: 500 },
                                    description: { type: 'string' },
                                    status: { type: 'string', enum: ['pending', 'in_progress', 'done'] },
                                    priority: { type: 'string', enum: ['low', 'medium', 'high'] },
                                    deadline: { type: 'string', format: 'date-time', nullable: true },
                                },
                            },
                        },
                    },
                },
                responses: {
                    '200': {
                        description: 'Task updated successfully',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        task: { $ref: '#/components/schemas/Task' },
                                    },
                                },
                            },
                        },
                    },
                    '404': {
                        description: 'Task not found',
                        content: {
                            'application/json': {
                                schema: { $ref: '#/components/schemas/Error' },
                            },
                        },
                    },
                },
            },
            delete: {
                tags: ['Tasks'],
                summary: 'Delete task (soft delete)',
                security: [{ cookieAuth: [] }],
                parameters: [
                    {
                        name: 'id',
                        in: 'path',
                        required: true,
                        schema: { type: 'string' },
                    },
                ],
                responses: {
                    '200': {
                        description: 'Task deleted successfully',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        message: { type: 'string' },
                                    },
                                },
                            },
                        },
                    },
                    '404': {
                        description: 'Task not found',
                        content: {
                            'application/json': {
                                schema: { $ref: '#/components/schemas/Error' },
                            },
                        },
                    },
                },
            },
        },
    },
};

const options: swaggerJsdoc.Options = {
    definition: swaggerDefinition,
    apis: [],
};

export const swaggerSpec = swaggerJsdoc(options);

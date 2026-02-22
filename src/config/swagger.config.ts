import { OpenAPIV3 } from 'openapi-types';
import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Partner App API',
            version: '1.0.0',
            description: 'API documentation for Partner App',
            contact: {
                name: 'API Support',
            },
        },
        servers: [
            {
                url: '/partner-app/api',
                description: 'API Server',
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                },
            },
            schemas: {
                RegisterUserDto: {
                    type: 'object',
                    required: [
                        'email',
                        'unhashedPassword',
                        'firstName',
                        'lastName',
                    ],
                    properties: {
                        email: {
                            type: 'string',
                            format: 'email',
                            description: 'User email address',
                            example: 'user@example.com',
                        },
                        unhashedPassword: {
                            type: 'string',
                            minLength: 8,
                            description:
                                'Password must contain at least one uppercase letter, one lowercase letter, and one number',
                            example: 'Password123',
                        },
                        firstName: {
                            type: 'string',
                            minLength: 1,
                            description: 'User first name',
                            example: 'John',
                        },
                        lastName: {
                            type: 'string',
                            minLength: 1,
                            description: 'User last name',
                            example: 'Doe',
                        },
                    },
                },
                LoginUserDto: {
                    type: 'object',
                    required: ['email', 'password'],
                    properties: {
                        email: {
                            type: 'string',
                            format: 'email',
                            description: 'User email address',
                            example: 'user@example.com',
                        },
                        password: {
                            type: 'string',
                            minLength: 1,
                            description: 'User password',
                            example: 'Password123',
                        },
                    },
                },
                UpdateProfileDto: {
                    type: 'object',
                    required: ['userId'],
                    properties: {
                        userId: {
                            type: 'string',
                            description: 'User ID',
                            example: '123e4567-e89b-12d3-a456-426614174000',
                        },
                        firstName: {
                            type: 'string',
                            description: 'Updated first name',
                            example: 'Jane',
                        },
                        lastName: {
                            type: 'string',
                            description: 'Updated last name',
                            example: 'Smith',
                        },
                    },
                },
                UserProfileDto: {
                    type: 'object',
                    properties: {
                        id: {
                            type: 'string',
                            description: 'User ID',
                            example: '123e4567-e89b-12d3-a456-426614174000',
                        },
                        email: {
                            type: 'string',
                            format: 'email',
                            description: 'User email',
                            example: 'user@example.com',
                        },
                        firstName: {
                            type: 'string',
                            description: 'User first name',
                            example: 'John',
                        },
                        lastName: {
                            type: 'string',
                            description: 'User last name',
                            example: 'Doe',
                        },
                        role: {
                            type: 'string',
                            description: 'User role',
                            example: 'user',
                        },
                    },
                },
                Error: {
                    type: 'object',
                    properties: {
                        message: {
                            type: 'string',
                            description: 'Error message',
                        },
                    },
                },
            },
        },
        tags: [
            {
                name: 'Status',
                description: 'Server status endpoints',
            },
            {
                name: 'Users',
                description: 'User management and authentication',
            },
        ],
    },
    apis: ['./src/controllers/**/*.ts'],
};

export const swaggerSpec = swaggerJsdoc(options) as OpenAPIV3.Document;

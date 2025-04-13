/**
 * VEffect OpenAPI Generator Example
 *
 * This example demonstrates how to use VEffect's registry system to generate
 * a complete OpenAPI Specification (OAS) 3.0 document.
 *
 * Key concepts demonstrated:
 * 1. Defining schemas with VEffect's type system
 * 2. Using a registry with custom metadata for OpenAPI
 * 3. Registering schemas with their API metadata
 * 4. Generating a complete OpenAPI specification
 * 5. Exporting the spec to JSON/YAML
 * 6. Setting up an Express server with Swagger UI
 */


// import {
//   string,
//   number,
//   boolean,
//   object,
//   array,
//   union,
//   literal,
//   createRegistry,
//   registerSchema,
//   GlobalMetadata,
//   Schema
// } from 'veffect';
// import * as fs from 'fs';
// import * as yaml from 'js-yaml';
// import express, { Request, Response, NextFunction } from 'express';
// import * as swaggerUi from 'swagger-ui-express';

// // =======================================
// // ======= METADATA DEFINITIONS ==========
// // =======================================

// /**
//  * Custom metadata interface for OpenAPI endpoints
//  * This extends the GlobalMetadata from VEffect with OpenAPI-specific fields
//  */
// interface OpenAPIMetadata extends GlobalMetadata {
//   // Path operation details
//   path: string;
//   method: 'get' | 'post' | 'put' | 'patch' | 'delete';
//   operationId: string;
//   summary: string;
//   description?: string;
//   tags: string[];

//   // Security
//   security?: Array<Record<string, string[]>>;

//   // Request details
//   requestContentType?: string;
//   requestDescription?: string;
//   requestRequired?: boolean;

//   // Response details
//   responseSchema?: any;
//   responseDescription?: string;
//   responseContentType?: string;
//   responseExamples?: Record<string, any>;

//   // Parameters (path, query, header)
//   pathParams?: Record<string, {
//     description: string;
//     required?: boolean;
//     schema: any;
//     example?: any;
//   }>;

//   queryParams?: Record<string, {
//     description: string;
//     required?: boolean;
//     schema: any;
//     example?: any;
//   }>;

//   headerParams?: Record<string, {
//     description: string;
//     required?: boolean;
//     schema: any;
//     example?: any;
//   }>;

//   // Additional OpenAPI fields
//   deprecated?: boolean;
//   externalDocs?: {
//     description: string;
//     url: string;
//   };
// }

// /**
//  * Create a registry specifically for OpenAPI endpoints
//  * This registry will store schemas and their associated OpenAPI metadata
//  */
// const openAPIRegistry = createRegistry<OpenAPIMetadata>();

// // =======================================
// // ========== COMMON SCHEMAS ============
// // =======================================

// /**
//  * Standard error response schema
//  * Used for all error responses throughout the API
//  */
// const errorResponseSchema = object({
//   statusCode: number().integer(),
//   error: string(),
//   message: string()
// });

// /**
//  * Pagination information schema
//  * Used for paginated list responses
//  */
// const paginationSchema = object({
//   page: number().integer(),
//   limit: number().integer(),
//   totalItems: number().integer(),
//   totalPages: number().integer()
// });

// /**
//  * Generic paginated response wrapper
//  * Creates a container with data array and pagination info
//  * @param itemSchema - The schema for items in the data array
//  */
// const paginatedResponseSchema = <T extends Schema<unknown, unknown>>(itemSchema: T) => object({
//   data: array(itemSchema),
//   pagination: paginationSchema
// });

// // =======================================
// // =========== USER SCHEMAS =============
// // =======================================

// /**
//  * User entity schema
//  * Represents a user in the system with all properties
//  */
// const userSchema = object({
//   id: number().integer(),
//   username: string(),
//   email: string(),
//   firstName: string(),
//   lastName: string(),
//   role: string(),
//   createdAt: string(),
//   updatedAt: string()
// });

// /**
//  * User creation schema
//  * Used for POST request body when creating users
//  */
// const createUserSchema = object({
//   username: string(),
//   email: string(),
//   password: string(),
//   firstName: string(),
//   lastName: string(),
//   role: string()
// });

// /**
//  * User update schema
//  * Used for PUT request body when updating users
//  */
// const updateUserSchema = object({
//   username: string(),
//   email: string(),
//   firstName: string(),
//   lastName: string(),
//   role: string()
// });

// // =======================================
// // =========== PET SCHEMAS ==============
// // =======================================

// /**
//  * Pet status enum schema
//  * Defines the possible status values for a pet
//  */
// const petStatusSchema = union([
//   literal('available'),
//   literal('pending'),
//   literal('sold')
// ]);

// /**
//  * Pet entity schema
//  * Represents a pet in the system with all properties
//  */
// const petSchema = object({
//   id: number().integer(),
//   name: string(),
//   category: object({
//     id: number().integer(),
//     name: string()
//   }),
//   photoUrls: array(string()),
//   tags: array(object({
//     id: number().integer(),
//     name: string()
//   })),
//   status: petStatusSchema
// });

// /**
//  * Pet creation schema
//  * Used for POST request body when creating pets
//  */
// const createPetSchema = object({
//   name: string(),
//   category: object({
//     id: number().integer(),
//     name: string()
//   }),
//   photoUrls: array(string()),
//   tags: array(object({
//     id: number().integer(),
//     name: string()
//   })),
//   status: petStatusSchema
// });

// // =======================================
// // =========== ORDER SCHEMAS ============
// // =======================================

// /**
//  * Order entity schema
//  * Represents an order in the system with all properties
//  */
// const orderSchema = object({
//   id: number().integer(),
//   petId: number().integer(),
//   quantity: number().integer(),
//   shipDate: string(),
//   status: union([
//     literal('placed'),
//     literal('approved'),
//     literal('delivered')
//   ]),
//   complete: boolean()
// });

// /**
//  * Order creation schema
//  * Used for POST request body when creating orders
//  */
// const createOrderSchema = object({
//   petId: number().integer(),
//   quantity: number().integer(),
//   shipDate: string(),
//   status: union([
//     literal('placed'),
//     literal('approved'),
//     literal('delivered')
//   ]),
//   complete: boolean()
// });

// // =======================================
// // ======== USER API ENDPOINTS ==========
// // =======================================

// /**
//  * GET /users - List all users
//  *
//  * This endpoint demonstrates:
//  * - Query parameters for filtering and pagination
//  * - Returning a paginated list response
//  * - Security requirements (bearerAuth)
//  */
// const listUsersRequestSchema = object({
//   page: number().integer(),
//   limit: number().integer(),
//   role: string()
// });

// registerSchema(listUsersRequestSchema, openAPIRegistry, {
//   path: '/users',
//   method: 'get',
//   operationId: 'listUsers',
//   summary: 'List all users',
//   description: 'Returns a paginated list of users with optional filtering',
//   tags: ['Users'],
//   security: [{ bearerAuth: [] }],

//   queryParams: {
//     page: {
//       description: 'Page number',
//       required: false,
//       schema: number().integer(),
//       example: 1
//     },
//     limit: {
//       description: 'Items per page',
//       required: false,
//       schema: number().integer(),
//       example: 10
//     },
//     role: {
//       description: 'Filter by user role',
//       required: false,
//       schema: string(),
//       example: 'admin'
//     }
//   },

//   responseSchema: paginatedResponseSchema(userSchema),
//   responseDescription: 'A paginated list of users',
//   responseContentType: 'application/json',
//   responseExamples: {
//     'list-users-example': {
//       value: {
//         data: [
//           {
//             id: 1,
//             username: 'johndoe',
//             email: 'john@example.com',
//             firstName: 'John',
//             lastName: 'Doe',
//             role: 'admin',
//             createdAt: '2023-01-01T00:00:00Z',
//             updatedAt: '2023-01-01T00:00:00Z'
//           },
//           {
//             id: 2,
//             username: 'janedoe',
//             email: 'jane@example.com',
//             firstName: 'Jane',
//             lastName: 'Doe',
//             role: 'user',
//             createdAt: '2023-01-02T00:00:00Z',
//             updatedAt: '2023-01-02T00:00:00Z'
//           }
//         ],
//         pagination: {
//           page: 1,
//           limit: 10,
//           totalItems: 2,
//           totalPages: 1
//         }
//       }
//     }
//   }
// });

// /**
//  * GET /users/{id} - Get a user by ID
//  *
//  * This endpoint demonstrates:
//  * - Path parameters
//  * - Returning a single entity
//  * - Security requirements (bearerAuth)
//  */
// const getUserRequestSchema = object({
//   id: number().integer()
// });

// registerSchema(getUserRequestSchema, openAPIRegistry, {
//   path: '/users/{id}',
//   method: 'get',
//   operationId: 'getUserById',
//   summary: 'Get user by ID',
//   description: 'Returns a user by ID',
//   tags: ['Users'],
//   security: [{ bearerAuth: [] }],

//   pathParams: {
//     id: {
//       description: 'User ID',
//       required: true,
//       schema: number().integer(),
//       example: 1
//     }
//   },

//   responseSchema: userSchema,
//   responseDescription: 'The user',
//   responseContentType: 'application/json',
//   responseExamples: {
//     'get-user-example': {
//       value: {
//         id: 1,
//         username: 'johndoe',
//         email: 'john@example.com',
//         firstName: 'John',
//         lastName: 'Doe',
//         role: 'admin',
//         createdAt: '2023-01-01T00:00:00Z',
//         updatedAt: '2023-01-01T00:00:00Z'
//       }
//     }
//   }
// });

// /**
//  * POST /users - Create a new user
//  *
//  * This endpoint demonstrates:
//  * - Request body for creating a resource
//  * - Returning the created entity
//  * - Security requirements (bearerAuth)
//  */
// registerSchema(createUserSchema, openAPIRegistry, {
//   path: '/users',
//   method: 'post',
//   operationId: 'createUser',
//   summary: 'Create a new user',
//   description: 'Creates a new user and returns the created user',
//   tags: ['Users'],
//   security: [{ bearerAuth: [] }],

//   requestContentType: 'application/json',
//   requestDescription: 'User to create',
//   requestRequired: true,

//   responseSchema: userSchema,
//   responseDescription: 'The created user',
//   responseContentType: 'application/json',
//   responseExamples: {
//     'create-user-example': {
//       value: {
//         id: 3,
//         username: 'newuser',
//         email: 'newuser@example.com',
//         firstName: 'New',
//         lastName: 'User',
//         role: 'user',
//         createdAt: '2023-01-03T00:00:00Z',
//         updatedAt: '2023-01-03T00:00:00Z'
//       }
//     }
//   }
// });

// // PUT /users/{id} - Update a user
// registerSchema(updateUserSchema, openAPIRegistry, {
//   path: '/users/{id}',
//   method: 'put',
//   operationId: 'updateUser',
//   summary: 'Update a user',
//   description: 'Updates a user and returns the updated user',
//   tags: ['Users'],
//   security: [{ bearerAuth: [] }],

//   pathParams: {
//     id: {
//       description: 'User ID',
//       required: true,
//       schema: number().integer(),
//       example: 1
//     }
//   },

//   requestContentType: 'application/json',
//   requestDescription: 'User to update',
//   requestRequired: true,

//   responseSchema: userSchema,
//   responseDescription: 'The updated user',
//   responseContentType: 'application/json',
//   responseExamples: {
//     'update-user-example': {
//       value: {
//         id: 1,
//         username: 'johndoe_updated',
//         email: 'john_updated@example.com',
//         firstName: 'John',
//         lastName: 'Doe',
//         role: 'admin',
//         createdAt: '2023-01-04T00:00:00Z',
//         updatedAt: '2023-01-04T00:00:00Z'
//       }
//     }
//   }
// });

// // DELETE /users/{id} - Delete a user
// const deleteUserRequestSchema = object({
//   id: number().integer()
// });

// registerSchema(deleteUserRequestSchema, openAPIRegistry, {
//   path: '/users/{id}',
//   method: 'delete',
//   operationId: 'deleteUser',
//   summary: 'Delete a user',
//   description: 'Deletes a user',
//   tags: ['Users'],
//   security: [{ bearerAuth: [] }],

//   pathParams: {
//     id: {
//       description: 'User ID',
//       required: true,
//       schema: number().integer(),
//       example: 1
//     }
//   },

//   responseSchema: object({
//     success: boolean(),
//     message: string()
//   }),
//   responseDescription: 'Deletion confirmation',
//   responseContentType: 'application/json',
//   responseExamples: {
//     'delete-user-example': {
//       value: {
//         success: true,
//         message: 'User deleted successfully'
//       }
//     }
//   }
// });

// // =======================================
// // =========== PET API ENDPOINTS ========
// // =======================================

// // GET /pets - List all pets
// const listPetsRequestSchema = object({
//   page: number().integer(),
//   limit: number().integer(),
//   status: petStatusSchema
// });

// registerSchema(listPetsRequestSchema, openAPIRegistry, {
//   path: '/pets',
//   method: 'get',
//   operationId: 'listPets',
//   summary: 'List all pets',
//   description: 'Returns a paginated list of pets with optional filtering by status',
//   tags: ['Pets'],

//   queryParams: {
//     page: {
//       description: 'Page number',
//       required: false,
//       schema: number().integer(),
//       example: 1
//     },
//     limit: {
//       description: 'Items per page',
//       required: false,
//       schema: number().integer(),
//       example: 10
//     },
//     status: {
//       description: 'Filter by pet status',
//       required: false,
//       schema: petStatusSchema,
//       example: 'available'
//     }
//   },

//   responseSchema: paginatedResponseSchema(petSchema),
//   responseDescription: 'A paginated list of pets',
//   responseContentType: 'application/json',
//   responseExamples: {
//     'list-pets-example': {
//       value: {
//         data: [
//           {
//             id: 1,
//             name: 'Fluffy',
//             category: {
//               id: 1,
//               name: 'Dog'
//             },
//             photoUrls: ['https://example.com/photos/1'],
//             tags: [
//               {
//                 id: 1,
//                 name: 'friendly'
//               }
//             ],
//             status: 'available'
//           },
//           {
//             id: 2,
//             name: 'Whiskers',
//             category: {
//               id: 2,
//               name: 'Cat'
//             },
//             photoUrls: ['https://example.com/photos/2'],
//             tags: [
//               {
//                 id: 2,
//                 name: 'playful'
//               }
//             ],
//             status: 'pending'
//           }
//         ],
//         pagination: {
//           page: 1,
//           limit: 10,
//           totalItems: 2,
//           totalPages: 1
//         }
//       }
//     }
//   }
// });

// // GET /pets/{id} - Get a pet by ID
// const getPetRequestSchema = object({
//   id: number().integer()
// });

// registerSchema(getPetRequestSchema, openAPIRegistry, {
//   path: '/pets/{id}',
//   method: 'get',
//   operationId: 'getPetById',
//   summary: 'Get pet by ID',
//   description: 'Returns a pet by ID',
//   tags: ['Pets'],

//   pathParams: {
//     id: {
//       description: 'Pet ID',
//       required: true,
//       schema: number().integer(),
//       example: 1
//     }
//   },

//   responseSchema: petSchema,
//   responseDescription: 'The pet',
//   responseContentType: 'application/json',
//   responseExamples: {
//     'get-pet-example': {
//       value: {
//         id: 1,
//         name: 'Fluffy',
//         category: {
//           id: 1,
//           name: 'Dog'
//         },
//         photoUrls: ['https://example.com/photos/1'],
//         tags: [
//           {
//             id: 1,
//             name: 'friendly'
//           }
//         ],
//         status: 'available'
//       }
//     }
//   }
// });

// // POST /pets - Create a new pet
// registerSchema(createPetSchema, openAPIRegistry, {
//   path: '/pets',
//   method: 'post',
//   operationId: 'createPet',
//   summary: 'Create a new pet',
//   description: 'Creates a new pet and returns the created pet',
//   tags: ['Pets'],
//   security: [{ bearerAuth: [] }],

//   requestContentType: 'application/json',
//   requestDescription: 'Pet to create',
//   requestRequired: true,

//   responseSchema: petSchema,
//   responseDescription: 'The created pet',
//   responseContentType: 'application/json',
//   responseExamples: {
//     'create-pet-example': {
//       value: {
//         id: 3,
//         name: 'Rex',
//         category: {
//           id: 1,
//           name: 'Dog'
//         },
//         photoUrls: ['https://example.com/photos/3'],
//         tags: [
//           {
//             id: 3,
//             name: 'trained'
//           }
//         ],
//         status: 'available'
//       }
//     }
//   }
// });

// // =======================================
// // ======= ORDER API ENDPOINTS ==========
// // =======================================

// // POST /store/orders - Place an order
// registerSchema(createOrderSchema, openAPIRegistry, {
//   path: '/store/orders',
//   method: 'post',
//   operationId: 'placeOrder',
//   summary: 'Place an order for a pet',
//   description: 'Places an order for a pet and returns the order details',
//   tags: ['Store'],
//   security: [{ bearerAuth: [] }],

//   requestContentType: 'application/json',
//   requestDescription: 'Order to place',
//   requestRequired: true,

//   responseSchema: orderSchema,
//   responseDescription: 'The placed order',
//   responseContentType: 'application/json',
//   responseExamples: {
//     'place-order-example': {
//       value: {
//         id: 1,
//         petId: 1,
//         quantity: 1,
//         shipDate: '2023-01-05T00:00:00Z',
//         status: 'placed',
//         complete: false
//       }
//     }
//   }
// });

// // GET /store/orders/{id} - Get order by ID
// const getOrderRequestSchema = object({
//   id: number().integer()
// });

// registerSchema(getOrderRequestSchema, openAPIRegistry, {
//   path: '/store/orders/{id}',
//   method: 'get',
//   operationId: 'getOrderById',
//   summary: 'Get order by ID',
//   description: 'Returns an order by ID',
//   tags: ['Store'],
//   security: [{ bearerAuth: [] }],

//   pathParams: {
//     id: {
//       description: 'Order ID',
//       required: true,
//       schema: number().integer(),
//       example: 1
//     }
//   },

//   responseSchema: orderSchema,
//   responseDescription: 'The order',
//   responseContentType: 'application/json',
//   responseExamples: {
//     'get-order-example': {
//       value: {
//         id: 1,
//         petId: 1,
//         quantity: 1,
//         shipDate: '2023-01-05T00:00:00Z',
//         status: 'placed',
//         complete: false
//       }
//     }
//   }
// });

// // =======================================
// // === OPENAPI SPEC GENERATION LOGIC ====
// // =======================================

// /**
//  * Generates a complete OpenAPI Specification 3.0 document from the registry
//  *
//  * This function:
//  * 1. Creates the paths object from registered endpoints
//  * 2. Builds the components schemas section
//  * 3. Processes each registry entry to create operations
//  * 4. Adds common response codes and security definitions
//  * 5. Returns a complete OpenAPI 3.0.3 specification
//  *
//  * @param registry - The VEffect registry with OpenAPI metadata
//  * @returns A complete OpenAPI specification object
//  */
// function generateOpenAPISpecification(registry: typeof openAPIRegistry): any {
//   // Paths object for OpenAPI
//   const paths: Record<string, any> = {};

//   // Components object for reusable schemas
//   const components: Record<string, any> = {
//     schemas: {
//       // Convert component schemas to OpenAPI format
//       'ErrorResponse': toOpenAPISchema(errorResponseSchema),
//       'User': toOpenAPISchema(userSchema),
//       'Pet': toOpenAPISchema(petSchema),
//       'Order': toOpenAPISchema(orderSchema),
//       'PaginationInfo': toOpenAPISchema(paginationSchema),
//       'PetStatus': toOpenAPISchema(petStatusSchema)
//     },
//     securitySchemes: {
//       bearerAuth: {
//         type: 'http',
//         scheme: 'bearer',
//         bearerFormat: 'JWT'
//       }
//     }
//   };

//   // Process each registry entry
//   registry.getAll().forEach(([schema, metadata]) => {
//     const { path, method, operationId, summary, description, tags, security,
//       pathParams, queryParams, headerParams,
//       requestContentType, requestDescription, requestRequired,
//       responseSchema, responseDescription, responseContentType, responseExamples,
//       deprecated, externalDocs } = metadata;

//     // Initialize path if it doesn't exist
//     if (!paths[path]) {
//       paths[path] = {};
//     }

//     // Initialize method operation
//     const operation: Record<string, any> = {
//       operationId,
//       summary,
//       tags,
//       responses: {}
//     };

//     // Add description if provided
//     if (description) {
//       operation.description = description;
//     }

//     // Add security if provided
//     if (security) {
//       operation.security = security;
//     }

//     // Add external docs if provided
//     if (externalDocs) {
//       operation.externalDocs = externalDocs;
//     }

//     // Add deprecated flag if provided
//     if (deprecated) {
//       operation.deprecated = deprecated;
//     }

//     // Process parameters
//     const parameters: any[] = [];

//     // Path parameters
//     if (pathParams) {
//       Object.entries(pathParams).forEach(([name, paramInfo]) => {
//         parameters.push({
//           name,
//           in: 'path',
//           description: paramInfo.description,
//           required: paramInfo.required !== false, // path params are required by default
//           schema: toOpenAPISchema(paramInfo.schema),
//           example: paramInfo.example
//         });
//       });
//     }

//     // Query parameters
//     if (queryParams) {
//       Object.entries(queryParams).forEach(([name, paramInfo]) => {
//         parameters.push({
//           name,
//           in: 'query',
//           description: paramInfo.description,
//           required: !!paramInfo.required,
//           schema: toOpenAPISchema(paramInfo.schema),
//           example: paramInfo.example
//         });
//       });
//     }

//     // Header parameters
//     if (headerParams) {
//       Object.entries(headerParams).forEach(([name, paramInfo]) => {
//         parameters.push({
//           name,
//           in: 'header',
//           description: paramInfo.description,
//           required: !!paramInfo.required,
//           schema: toOpenAPISchema(paramInfo.schema),
//           example: paramInfo.example
//         });
//       });
//     }

//     // Add parameters if any
//     if (parameters.length > 0) {
//       operation.parameters = parameters;
//     }

//     // Request body
//     if (method !== 'get' && method !== 'delete') {
//       operation.requestBody = {
//         description: requestDescription || 'Request payload',
//         required: requestRequired !== false,
//         content: {
//           [requestContentType || 'application/json']: {
//             schema: toOpenAPISchema(schema)
//           }
//         }
//       };
//     }

//     // Success response
//     operation.responses['200'] = {
//       description: responseDescription || 'Successful operation',
//       content: {
//         [responseContentType || 'application/json']: {
//           schema: responseSchema ? toOpenAPISchema(responseSchema) : {},
//           examples: responseExamples || {}
//         }
//       }
//     };

//     // Common error responses
//     operation.responses['400'] = {
//       description: 'Bad request',
//       content: {
//         'application/json': {
//           schema: components.schemas.ErrorResponse,
//           examples: {
//             'bad-request': {
//               value: {
//                 statusCode: 400,
//                 error: 'Bad Request',
//                 message: 'Invalid request payload'
//               }
//             }
//           }
//         }
//       }
//     };

//     operation.responses['401'] = {
//       description: 'Unauthorized',
//       content: {
//         'application/json': {
//           schema: components.schemas.ErrorResponse,
//           examples: {
//             'unauthorized': {
//               value: {
//                 statusCode: 401,
//                 error: 'Unauthorized',
//                 message: 'Authentication required'
//               }
//             }
//           }
//         }
//       }
//     };

//     operation.responses['404'] = {
//       description: 'Not found',
//       content: {
//         'application/json': {
//           schema: components.schemas.ErrorResponse,
//           examples: {
//             'not-found': {
//               value: {
//                 statusCode: 404,
//                 error: 'Not Found',
//                 message: 'Resource not found'
//               }
//             }
//           }
//         }
//       }
//     };

//     operation.responses['500'] = {
//       description: 'Internal server error',
//       content: {
//         'application/json': {
//           schema: components.schemas.ErrorResponse,
//           examples: {
//             'server-error': {
//               value: {
//                 statusCode: 500,
//                 error: 'Internal Server Error',
//                 message: 'An unexpected error occurred'
//               }
//             }
//           }
//         }
//       }
//     };

//     // Add operation to path
//     paths[path][method] = operation;
//   });

//   // Construct the final OpenAPI document
//   return {
//     openapi: '3.0.3',
//     info: {
//       title: 'VEffect API Example',
//       description: 'Example API powered by VEffect schema registry',
//       version: '1.0.0',
//       contact: {
//         name: 'API Support',
//         url: 'https://example.com/support',
//         email: 'support@example.com'
//       },
//       license: {
//         name: 'MIT',
//         url: 'https://opensource.org/licenses/MIT'
//       }
//     },
//     servers: [
//       {
//         url: 'https://api.example.com/v1',
//         description: 'Production server'
//       },
//       {
//         url: 'https://staging-api.example.com/v1',
//         description: 'Staging server'
//       },
//       {
//         url: 'http://localhost:3000/v1',
//         description: 'Local development server'
//       }
//     ],
//     tags: [
//       {
//         name: 'Users',
//         description: 'User management'
//       },
//       {
//         name: 'Pets',
//         description: 'Pet management'
//       },
//       {
//         name: 'Store',
//         description: 'Store operations'
//       }
//     ],
//     paths,
//     components
//   };
// }

// // =======================================
// // =========== ENTRY POINT ==============
// // =======================================

// /**
//  * Main function to generate and use the OpenAPI specification
//  *
//  * This function:
//  * 1. Generates the OpenAPI specification from the registry
//  * 2. Outputs a summary to the console
//  * 3. Saves the specification to JSON and YAML files
//  * 4. Returns the specification for further use
//  *
//  * Note: The VEffect schemas are converted to OpenAPI format using
//  * the toOpenAPISchema utility function, which ensures that:
//  * - Primitive types (string, number, boolean) are mapped correctly
//  * - Object properties and nested schemas are properly transformed
//  * - Union types are converted to OpenAPI enums when appropriate
//  * - Arrays have their item schemas properly defined
//  *
//  * @returns The complete OpenAPI specification object
//  */
// function main() {
//   // Generate the OpenAPI specification
//   const openAPISpec = generateOpenAPISpecification(openAPIRegistry);

//   // Output a summary
//   console.log("\n=== OPENAPI SPECIFICATION SUMMARY ===");
//   console.log(`OpenAPI Version: ${openAPISpec.openapi}`);
//   console.log(`API Title: ${openAPISpec.info.title}`);
//   console.log(`API Version: ${openAPISpec.info.version}`);
//   console.log(`Total Paths: ${Object.keys(openAPISpec.paths).length}`);
//   console.log(`Total Operations: ${Object.values(openAPISpec.paths).reduce((acc: number, pathItem: any) =>
//     acc + Object.keys(pathItem).length, 0)}`);
//   console.log(`Component Schemas: ${Object.keys(openAPISpec.components.schemas).length}`);
//   console.log(`Tags: ${openAPISpec.tags.map((tag: any) => tag.name).join(', ')}`);

//   // Save the specification to file (if fs is available)
//   try {
//     const jsonSpec = JSON.stringify(openAPISpec, null, 2);
//     fs.writeFileSync('openapi-spec.json', jsonSpec);
//     console.log("\nOpenAPI specification saved to openapi-spec.json");

//     // For YAML export, we need to prepare a clean, serializable object
//     try {
//       // Parse and re-stringify JSON to remove function references
//       const cleanObject = JSON.parse(JSON.stringify(openAPISpec));
//       const yamlSpec = yaml.dump(cleanObject, { indent: 2 });
//       fs.writeFileSync('openapi-spec.yaml', yamlSpec);
//       console.log("OpenAPI specification saved to openapi-spec.yaml");
//     } catch (error: any) {
//       console.error("Could not save YAML version:", error.message);
//     }
//   } catch (error: any) {
//     console.error("Could not save JSON version:", error.message);
//   }

//   // Return the spec for further usage
//   return openAPISpec;
// }

// /**
//  * Auto-execution when run directly (not imported as a module)
//  *
//  * If this file is run directly (not imported), it will:
//  * 1. Generate the OpenAPI specification
//  * 2. Set up an Express server with Swagger UI
//  * 3. Start the server to demonstrate the API documentation
//  */
// if (require.main === module) {
//   // Generate the OpenAPI specification
//   const openAPISpec = main();

//   // If express and swagger-ui are available, set up a server
//   try {
//     const app = express();
//     const PORT = 3000;

//     // Serve Swagger UI
//     app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(openAPISpec));

//     // Example validation middleware
//     function createValidationMiddleware(schema: any) {
//       return (req: Request, res: Response, next: NextFunction) => {
//         // Here you would use VEffect's validate function
//         // For now just a placeholder
//         next();
//       };
//     }

//     // Example routes
//     app.get('/v1/users', (req: Request, res: Response) => {
//       res.json({
//         data: [
//           {
//             id: 1,
//             username: 'johndoe',
//             email: 'john@example.com',
//             firstName: 'John',
//             lastName: 'Doe',
//             role: 'admin',
//             createdAt: '2023-01-01T00:00:00Z',
//             updatedAt: '2023-01-01T00:00:00Z'
//           }
//         ],
//         pagination: {
//           page: 1,
//           limit: 10,
//           totalItems: 1,
//           totalPages: 1
//         }
//       });
//     });

//     app.listen(PORT, () => {
//       console.log(`\nServer running at http://localhost:${PORT}`);
//       console.log(`Swagger UI available at http://localhost:${PORT}/api-docs`);
//     });
//   } catch (error: any) {
//     console.error("Could not start Express server:", error.message);
//   }
// }

// /**
//  * Exports for use in other modules
//  *
//  * These exports allow other files to use the schemas,
//  * registry, and generation functions
//  */
// export {
//   openAPIRegistry,
//   generateOpenAPISpecification,
//   toOpenAPISchema,
//   userSchema,
//   petSchema,
//   orderSchema,
//   errorResponseSchema,
//   paginationSchema,
//   paginatedResponseSchema
// };

// /**
//  * Utility function to convert VEffect schemas to proper OpenAPI schema objects
//  * This ensures that types are correctly represented in the OpenAPI specification
//  *
//  * This implementation uses a lookup table pattern instead of a switch statement,
//  * which provides several benefits:
//  * - Better organization of converters by schema type
//  * - Easier to extend with new schema types
//  * - Improved readability by grouping related logic
//  * - More maintainable as each converter is a separate function
//  *
//  * Conversion rules:
//  * - StringSchema -> { type: 'string' }
//  * - NumberSchema -> { type: 'number' } or { type: 'integer' }
//  * - BooleanSchema -> { type: 'boolean' }
//  * - ObjectSchema -> { type: 'object', properties: {...} }
//  * - ArraySchema -> { type: 'array', items: {...} }
//  * - UnionSchema of literals -> { type: 'string', enum: [...] }
//  * - UnionSchema of mixed types -> { oneOf: [...] }
//  * - LiteralSchema -> { type: '...', enum: [value] }
//  *
//  * @param schema - The VEffect schema to convert
//  * @returns An OpenAPI compatible schema object
//  */
// function toOpenAPISchema(schema: any): any {
//   // For simple VEffect schemas that don't have a complex structure
//   if (!schema || typeof schema !== 'object') {
//     return schema;
//   }

//   // If schema has a _tag property, it's a VEffect primitive schema
//   if (schema._tag) {
//     // Schema converters lookup table
//     const schemaConverters: Record<string, (s: any) => any> = {
//       // Convert string schema to OpenAPI string type
//       StringSchema: () => ({ type: 'string' }),

//       // Convert number schema to OpenAPI number or integer type
//       NumberSchema: (s: any) => ({
//         type: s.isInteger ? 'integer' : 'number'
//       }),

//       // Convert boolean schema to OpenAPI boolean type
//       BooleanSchema: () => ({ type: 'boolean' }),

//       // Convert object schema to OpenAPI object type with properties
//       ObjectSchema: (s: any) => {
//         if (!s.properties) return { type: 'object' };

//         const properties: Record<string, any> = {};
//         const required: string[] = [];

//         // Process each property
//         Object.entries(s.properties).forEach(([key, prop]: [string, any]) => {
//           properties[key] = toOpenAPISchema(prop);

//           // If property is required, add to required array
//           if (prop.isRequired) {
//             required.push(key);
//           }
//         });

//         return {
//           type: 'object',
//           properties,
//           ...(required.length > 0 ? { required } : {})
//         };
//       },

//       // Convert array schema to OpenAPI array type with items
//       ArraySchema: (s: any) => ({
//         type: 'array',
//         items: toOpenAPISchema(s.element)
//       }),

//       // Convert union schema to OpenAPI enum or oneOf
//       UnionSchema: (s: any) => {
//         // Check if we have alternatives array or schemas array
//         const alternatives = s.alternatives || s.schemas;

//         if (!Array.isArray(alternatives)) return {};

//         // Check if all alternatives are literals for enum
//         const literalValues = [];
//         let allLiterals = true;
//         let literalType = '';

//         for (const alt of alternatives) {
//           if (alt._tag === 'LiteralSchema') {
//             literalValues.push(alt.value);
//             if (!literalType) {
//               literalType = typeof alt.value;
//             } else if (typeof alt.value !== literalType) {
//               // Mixed types, can't use enum
//               allLiterals = false;
//               break;
//             }
//           } else {
//             allLiterals = false;
//             break;
//           }
//         }

//         if (allLiterals && literalValues.length > 0) {
//           // It's an enum of same-type literals
//           return {
//             type: literalType === 'number' ? 'number' : 'string',
//             enum: literalValues
//           };
//         }

//         // Otherwise use oneOf for complex unions
//         return {
//           oneOf: alternatives.map((alt: any) => toOpenAPISchema(alt))
//         };
//       },

//       // Convert literal schema to OpenAPI enum with one value
//       LiteralSchema: (s: any) => {
//         const literalType = typeof s.value;
//         return {
//           type: literalType === 'number' ? 'number' :
//             literalType === 'boolean' ? 'boolean' : 'string',
//           enum: [s.value]
//         };
//       }
//     };

//     // Use the converter from the lookup table or return empty object
//     const converter = schemaConverters[schema._tag];
//     return converter ? converter(schema) : {};
//   }

//   // Handle nested schemas or objects
//   const result: Record<string, any> = {};
//   for (const key in schema) {
//     result[key] = toOpenAPISchema(schema[key]);
//   }

//   return result;
// }

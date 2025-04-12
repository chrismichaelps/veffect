import { string, number, boolean, object, array, tuple, union, literal } from '../dist';

console.log('Practical API Validation Example:');
console.log('--------------------------------');

// ========================================
// SCHEMA DEFINITIONS
// ========================================

// User schema definition
const userSchema = object({
  id: string().uuid(),
  username: string().minLength(3).maxLength(50),
  email: string().email(),
  profilePicture: string().url().optional(),
  isActive: boolean().default(true),
  createdAt: string().datetime()
});

// Post schema with author relationship
const postSchema = object({
  id: string().uuid(),
  title: string().minLength(5).maxLength(200),
  content: string(),
  published: boolean().default(false),
  authorId: string().uuid(),
  tags: array(string()),
  viewCount: number().integer().default(0),
  createdAt: string().datetime()
});

// Comment schema with relationships
const commentSchema = object({
  id: string().uuid(),
  content: string(),
  postId: string().uuid(),
  authorId: string().uuid(),
  createdAt: string().datetime()
});

// ========================================
// API REQUEST/RESPONSE SCHEMAS
// ========================================

// GET /users/:id
const getUserResponseSchema = userSchema;

// GET /users/:id/posts
const getUserPostsResponseSchema = array(postSchema);

// POST /users (create user)
const createUserRequestSchema = object({
  username: string().minLength(3).maxLength(50),
  email: string().email(),
  password: string().minLength(8)
}).transform(data => ({
  ...data,
  // Add additional fields that would be set by the server
  id: 'generated-uuid',
  isActive: true,
  createdAt: new Date().toISOString()
}));

// POST /posts (create post)
const createPostRequestSchema = object({
  title: string().minLength(5).maxLength(200),
  content: string(),
  published: boolean().optional(),
  tags: array(string()).default([])
});

// PUT /posts/:id (update post)
const updatePostRequestSchema = object({
  title: string().minLength(5).maxLength(200).optional(),
  content: string().optional(),
  published: boolean().optional(),
  tags: array(string()).optional()
});

// ========================================
// ERROR TYPES
// ========================================

// API error schema for standardized error responses
const apiErrorSchema = object({
  statusCode: number().integer(),
  message: string(),
  path: string(),
  timestamp: string().datetime()
});

// ========================================
// PRACTICAL EXAMPLE: API REQUEST HANDLING
// ========================================

// Simulate an API request handler for creating a user
function handleCreateUser(requestBody: unknown) {
  console.log('Received create user request:', requestBody);

  // Validate the request body
  const result = createUserRequestSchema.toValidator().safeParse(requestBody);

  if (!result.success) {
    console.log('Validation failed:', result.error);
    return {
      statusCode: 400,
      message: 'Invalid request data',
      errors: result.error,
      path: '/users',
      timestamp: new Date().toISOString()
    };
  }

  // Validation passed, we have a properly typed and transformed user object
  const validatedUser = result.data;
  console.log('Validation passed, processed data:', validatedUser);

  // In a real API, we would save the user to the database here
  // ...

  // Return success response
  return {
    statusCode: 201,
    message: 'User created successfully',
    data: {
      id: validatedUser.id,
      username: validatedUser.username,
      email: validatedUser.email
    }
  };
}

// ========================================
// EXAMPLE USAGE
// ========================================

// Example 1: Valid user creation request
console.log('\nExample 1: Valid user creation request');
const validUserRequest = {
  username: 'johndoe',
  email: 'john.doe@example.com',
  password: 'secureP@ssw0rd'
};

const validResponse = handleCreateUser(validUserRequest);
console.log('Response:', validResponse);

// Example 2: Invalid user creation request
console.log('\nExample 2: Invalid user creation request');
const invalidUserRequest = {
  username: 'jo', // Too short
  email: 'not-an-email',
  password: 'short' // Too short
};

const invalidResponse = handleCreateUser(invalidUserRequest);
console.log('Response:', invalidResponse);

// ========================================
// DISCRIMINATED API RESPONSES
// ========================================

// API response can be success or error
const apiResponseSchema = union([
  object({
    status: literal('success'),
    data: userSchema // Could be any data schema depending on the endpoint
  }),
  object({
    status: literal('error'),
    error: apiErrorSchema
  })
]);

// Parse a simulated API response
console.log('\nExample 3: Discriminated API Response');

const mockSuccessResponse = {
  status: 'success',
  data: {
    id: '123e4567-e89b-12d3-a456-426614174000',
    username: 'johndoe',
    email: 'john.doe@example.com',
    isActive: true,
    createdAt: '2023-07-15T14:30:00Z'
  }
};

const mockErrorResponse = {
  status: 'error',
  error: {
    statusCode: 404,
    message: 'User not found',
    path: '/users/123',
    timestamp: '2023-07-15T14:30:00Z'
  }
};

console.log('Success response validation:');
console.log(apiResponseSchema.toValidator().safeParse(mockSuccessResponse));

console.log('\nError response validation:');
console.log(apiResponseSchema.toValidator().safeParse(mockErrorResponse));

// Run with: npx ts-node playground/practical-api-validation.ts 
/**
 * Map and Set Schema Examples
 *
 * This file demonstrates the usage of Map and Set schemas, including:
 * - Basic validation
 * - Size constraints
 * - Map/Set operations
 * - Nested validation
 * - Refinements and transformations
 * - Optional, nullable, and default values
 */

import { map, set, string, number, object, array } from '../dist';

console.log('======== Map Schema Examples ========');

// Basic Map validation
const userScoreMap = map(string(), number());
const scoreValidator = userScoreMap.toValidator();

const validScores = new Map([
  ['alice', 95],
  ['bob', 87],
  ['charlie', 92]
]);

const invalidScores = new Map([
  ['dave', 88],
  ['eve', 'A+' as any] // Invalid value type
]);

console.log('\n1. Basic Map validation:');
console.log('Valid map result:', scoreValidator.safeParse(validScores));
console.log('Invalid map result:', scoreValidator.safeParse(invalidScores));
console.log('Non-map result:', scoreValidator.safeParse({ alice: 95, bob: 87 }));

// Map with size constraints
const teamMap = map(string(), array(string())).minSize(2).maxSize(5);
const teamValidator = teamMap.toValidator();

const validTeams = new Map([
  ['Team A', ['Alice', 'Bob', 'Charlie']],
  ['Team B', ['Dave', 'Eve']],
  ['Team C', ['Frank', 'Grace']]
]);

const smallTeams = new Map([
  ['Solo Team', ['Alice']]
]);

console.log('\n2. Map with size constraints:');
console.log('Valid teams map:', teamValidator.safeParse(validTeams));
console.log('Too small map:', teamValidator.safeParse(smallTeams));

// Map operations
const configMap = map(string(), string());
const dbConfigValidator = configMap.hasKey('database').toValidator();
const redisConfigValidator = configMap.hasValue('redis').toValidator();
const requiredEntriesValidator = configMap.entries([
  ['host', 'localhost'],
  ['port', '6379']
]).toValidator();

const dbConfig = new Map([
  ['database', 'postgres'],
  ['host', 'localhost'],
  ['port', '5432']
]);

const cacheConfig = new Map([
  ['cache', 'redis'],
  ['host', 'localhost'],
  ['port', '6379']
]);

console.log('\n3. Map operations:');
console.log('Has database key:', dbConfigValidator.safeParse(dbConfig));
console.log('Missing database key:', dbConfigValidator.safeParse(cacheConfig));
console.log('Has redis value:', redisConfigValidator.safeParse(cacheConfig));
console.log('Has required entries:', requiredEntriesValidator.safeParse(cacheConfig));
console.log('Missing required entries:', requiredEntriesValidator.safeParse(dbConfig));

// Nested validation
const userPermissionsMap = map(
  string(),
  set(string().refine(
    s => ['read', 'write', 'delete', 'admin'].includes(s),
    'Permission must be one of: read, write, delete, admin'
  ))
);
const permissionsValidator = userPermissionsMap.toValidator();

const validPermissions = new Map([
  ['alice', new Set(['read', 'write', 'admin'])],
  ['bob', new Set(['read', 'write'])],
  ['guest', new Set(['read'])]
]);

const invalidPermissions = new Map([
  ['alice', new Set(['read', 'write'])],
  ['bob', new Set(['read', 'execute'])] // Invalid permission
]);

console.log('\n4. Nested Map validation:');
console.log('Valid permissions:', permissionsValidator.safeParse(validPermissions));
console.log('Invalid permissions:', permissionsValidator.safeParse(invalidPermissions));

// Map transformations
const sumScoresSchema = map(string(), number()).transform(
  m => [...m.values()].reduce((sum, score) => sum + score, 0)
);
const averageScoreSchema = map(string(), number()).transform(
  m => {
    const scores = [...m.values()];
    return scores.reduce((sum, score) => sum + score, 0) / scores.length;
  }
);

console.log('\n5. Map transformations:');
console.log('Sum of scores:', sumScoresSchema.toValidator().safeParse(validScores));
console.log('Average score:', averageScoreSchema.toValidator().safeParse(validScores));

// Map to object transformation
const mapToObjectSchema = map(string(), number()).transform(
  m => {
    const obj: Record<string, number> = {};
    m.forEach((value, key) => {
      obj[key] = value;
    });
    return obj;
  }
);

console.log('\n6. Map to object transformation:');
console.log('Map as object:', mapToObjectSchema.toValidator().safeParse(validScores));

// Optional and default maps
const defaultMap = new Map([['default', 0]]);
const optionalMapSchema = map(string(), number()).optional();
const defaultMapSchema = map(string(), number()).default(defaultMap);

console.log('\n7. Optional and default maps:');
console.log('Optional map with undefined:', optionalMapSchema.toValidator().safeParse(undefined));
console.log('Default map with undefined:', defaultMapSchema.toValidator().safeParse(undefined));

console.log('\n\n======== Set Schema Examples ========');

// Basic Set validation
const namesSet = set(string());
const namesValidator = namesSet.toValidator();

const validNames = new Set(['Alice', 'Bob', 'Charlie']);
const invalidNames = new Set(['Dave', 123 as any, 'Eve']); // Contains non-string

console.log('\n1. Basic Set validation:');
console.log('Valid set result:', namesValidator.safeParse(validNames));
console.log('Invalid set result:', namesValidator.safeParse(invalidNames));
console.log('Non-set result:', namesValidator.safeParse(['Alice', 'Bob', 'Charlie']));

// Set with size constraints
const teamSet = set(string()).minSize(2).maxSize(5);
const teamSetValidator = teamSet.toValidator();

const validTeam = new Set(['Alice', 'Bob', 'Charlie']);
const smallTeam = new Set(['Solo']);

console.log('\n2. Set with size constraints:');
console.log('Valid team set:', teamSetValidator.safeParse(validTeam));
console.log('Too small set:', teamSetValidator.safeParse(smallTeam));

// Set operations
const adminRolesSet = set(string());
const hasAdminValidator = adminRolesSet.has('admin').toValidator();

const allRolesSet = new Set(['user', 'moderator', 'admin', 'guest']);
const basicRolesSet = new Set(['user', 'guest']);

const supersetValidator = adminRolesSet.superset(new Set(['user', 'admin'])).toValidator();
const subsetValidator = adminRolesSet.subset(allRolesSet).toValidator();

console.log('\n3. Set operations:');
console.log('Has admin role:', hasAdminValidator.safeParse(allRolesSet));
console.log('Missing admin role:', hasAdminValidator.safeParse(basicRolesSet));
console.log('Is superset of required roles:', supersetValidator.safeParse(allRolesSet));
console.log('Is subset of all roles:', subsetValidator.safeParse(basicRolesSet));

// Set validations with constraints
const positiveNumbersSet = set(number().positive());
const evenNumbersSet = set(number()).refine(
  s => [...s].every(n => n % 2 === 0),
  'Set must contain only even numbers'
);

const validPositiveNumbers = new Set([1, 2, 3, 4, 5]);
const invalidPositiveNumbers = new Set([1, 2, -3, 4, 5]);
const validEvenNumbers = new Set([2, 4, 6, 8]);
const invalidEvenNumbers = new Set([2, 3, 4]);

console.log('\n4. Set validations with constraints:');
console.log('Valid positive numbers:', positiveNumbersSet.toValidator().safeParse(validPositiveNumbers));
console.log('Invalid positive numbers:', positiveNumbersSet.toValidator().safeParse(invalidPositiveNumbers));
console.log('Valid even numbers:', evenNumbersSet.toValidator().safeParse(validEvenNumbers));
console.log('Invalid even numbers:', evenNumbersSet.toValidator().safeParse(invalidEvenNumbers));

// Set transformations
const sumSetSchema = set(number()).transform(
  s => [...s].reduce((sum, n) => sum + n, 0)
);
const toArraySchema = set(string()).transform(
  s => [...s].sort()
);

console.log('\n5. Set transformations:');
console.log('Sum of set:', sumSetSchema.toValidator().safeParse(new Set([1, 2, 3, 4, 5])));
console.log('Set to sorted array:', toArraySchema.toValidator().safeParse(new Set(['Charlie', 'Alice', 'Bob'])));

// Optional and default sets
const defaultSet = new Set(['default']);
const optionalSetSchema = set(string()).optional();
const defaultSetSchema = set(string()).default(defaultSet);

console.log('\n6. Optional and default sets:');
console.log('Optional set with undefined:', optionalSetSchema.toValidator().safeParse(undefined));
console.log('Default set with undefined:', defaultSetSchema.toValidator().safeParse(undefined));

// Complex example: User roles and permissions system
console.log('\n\n======== Complex Example: User Roles and Permissions ========');

const userRolesSchema = object({
  userId: string(),
  roles: set(string().refine(
    s => ['admin', 'user', 'moderator', 'guest'].includes(s),
    'Role must be one of: admin, user, moderator, guest'
  )),
  permissions: map(
    string().refine(
      s => ['dashboard', 'users', 'content', 'settings'].includes(s),
      'Section must be one of: dashboard, users, content, settings'
    ),
    set(string().refine(
      s => ['read', 'write', 'delete'].includes(s),
      'Permission must be one of: read, write, delete'
    ))
  )
});

const user = {
  userId: "user123",
  roles: new Set(['admin', 'moderator']),
  permissions: new Map([
    ['dashboard', new Set(['read', 'write'])],
    ['users', new Set(['read', 'write', 'delete'])],
    ['content', new Set(['read'])]
  ])
};

const invalidUser = {
  userId: "user456",
  roles: new Set(['admin', 'invalid-role']),
  permissions: new Map([
    ['dashboard', new Set(['read', 'execute'])],
    ['invalid-section', new Set(['read'])]
  ])
};

console.log('Valid user:', userRolesSchema.toValidator().safeParse(user));
console.log('Invalid user:', userRolesSchema.toValidator().safeParse(invalidUser));

console.log('\nMap and Set schema examples completed!');

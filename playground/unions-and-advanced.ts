import { string, number, boolean, object, tuple, array, union, literal } from '../dist';

console.log('Union Schemas and Advanced Validation Examples:');
console.log('--------------------------------------------');

// Union of primitive types
const primitiveUnion = union([
  string(),
  number(),
  boolean()
]);

const primitiveValidator = primitiveUnion.toValidator();

console.log('Union of primitive types:');
console.log('String:', primitiveValidator.safeParse('hello'));
console.log('Number:', primitiveValidator.safeParse(42));
console.log('Boolean:', primitiveValidator.safeParse(true));
console.log('Invalid (object):', primitiveValidator.safeParse({}));
console.log('Invalid (null):', primitiveValidator.safeParse(null));

// Discriminated union of objects
// This models different shapes with a common "type" field
const circleSchema = object({
  type: literal('circle'),
  radius: number().positive()
});

const rectangleSchema = object({
  type: literal('rectangle'),
  width: number().positive(),
  height: number().positive()
});

const triangleSchema = object({
  type: literal('triangle'),
  base: number().positive(),
  height: number().positive()
});

const shapeUnion = union([
  circleSchema,
  rectangleSchema,
  triangleSchema
]);

const shapeValidator = shapeUnion.toValidator();

console.log('\nDiscriminated union (shapes):');
console.log('Circle:', shapeValidator.safeParse({
  type: 'circle',
  radius: 5
}));

console.log('Rectangle:', shapeValidator.safeParse({
  type: 'rectangle',
  width: 10,
  height: 20
}));

console.log('Triangle:', shapeValidator.safeParse({
  type: 'triangle',
  base: 10,
  height: 15
}));

console.log('Invalid shape:', shapeValidator.safeParse({
  type: 'hexagon',
  sides: 6
}));

// Advanced object transformation
const userInputSchema = object({
  name: string().trim(),
  email: string().trim().toLowerCase(),
  age: string() // Age comes as string from a form
}).transform(data => ({
  name: data.name,
  email: data.email,
  age: parseInt(data.age, 10) // Transform string to number
}));

const userInputValidator = userInputSchema.toValidator();

console.log('\nTransformation example:');
console.log(userInputValidator.safeParse({
  name: '  John Doe  ',
  email: '  JohnDoe@Example.com  ',
  age: '30'
}));

// Complex validation with multiple refinements
const passwordSchema = string()
  .minLength(8)
  .refine(
    password => /[A-Z]/.test(password),
    'Password must contain at least one uppercase letter'
  )
  .refine(
    password => /[a-z]/.test(password),
    'Password must contain at least one lowercase letter'
  )
  .refine(
    password => /[0-9]/.test(password),
    'Password must contain at least one number'
  )
  .refine(
    password => /[^A-Za-z0-9]/.test(password),
    'Password must contain at least one special character'
  );

const passwordValidator = passwordSchema.toValidator();

console.log('\nComplex password validation:');
console.log('Valid password:', passwordValidator.safeParse('Test1234!'));
console.log('Invalid (no uppercase):', passwordValidator.safeParse('test1234!'));
console.log('Invalid (no lowercase):', passwordValidator.safeParse('TEST1234!'));
console.log('Invalid (no number):', passwordValidator.safeParse('TestABCD!'));
console.log('Invalid (no special char):', passwordValidator.safeParse('Test1234'));
console.log('Invalid (too short):', passwordValidator.safeParse('Te1!'));

// Recursive data structure (tree nodes)
type TreeNode = {
  id: string;
  value: string;
  children?: TreeNode[];
};

// Need to use "any" for self-reference
const treeNodeSchema: any = object({
  id: string(),
  value: string(),
  children: array(null as any).optional()
});

// Now set the children schema
treeNodeSchema.properties.children = array(treeNodeSchema).optional();

const treeValidator = treeNodeSchema.toValidator();

const treeData = {
  id: 'root',
  value: 'Root Node',
  children: [
    {
      id: 'child1',
      value: 'Child 1',
      children: [
        { id: 'grandchild1', value: 'Grandchild 1' }
      ]
    },
    {
      id: 'child2',
      value: 'Child 2'
    }
  ]
};

console.log('\nRecursive schema validation:');
console.log(treeValidator.safeParse(treeData));

// Run with: npx ts-node playground/unions-and-advanced.ts 
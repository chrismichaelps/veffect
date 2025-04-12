/**
 * Registry and metadata system for VEffect
 */
import type { Schema } from './types';
import * as E from './internal/effect';
import { pipe } from './internal/effect';

/**
 * Type placeholder for schema input type (for type constraints in metadata)
 */
export type $input = any;

/**
 * Type placeholder for schema output type (for type constraints in metadata)
 */
export type $output = any;

/**
 * Base interface for the global registry metadata
 */
export interface GlobalMetadata {
  id?: string;
  title?: string;
  description?: string;
  examples?: $output[];
  [key: string]: unknown;
}

/**
 * Registry implementation for schema metadata management
 */
export class Registry<TMeta, TSchema extends Schema<any, any> = Schema<any, any>> {
  private storage = new Map<TSchema, TMeta>();

  /**
   * Add a schema to the registry with associated metadata
   */
  add(schema: TSchema, metadata: TMeta): TSchema {
    this.storage.set(schema, metadata);
    return schema;
  }

  /**
   * Check if a schema exists in the registry
   */
  has(schema: TSchema): boolean {
    return this.storage.has(schema);
  }

  /**
   * Get metadata associated with a schema
   */
  get(schema: TSchema): TMeta | undefined {
    return this.storage.get(schema);
  }

  /**
   * Remove a schema from the registry
   */
  remove(schema: TSchema): boolean {
    return this.storage.delete(schema);
  }

  /**
   * Get all schemas in the registry
   */
  getAllSchemas(): TSchema[] {
    return Array.from(this.storage.keys());
  }

  /**
   * Get all metadata in the registry
   */
  getAllMetadata(): TMeta[] {
    return Array.from(this.storage.values());
  }

  /**
   * Get all schemas and their associated metadata
   */
  getAll(): Array<[TSchema, TMeta]> {
    return Array.from(this.storage.entries());
  }

  /**
   * Find schemas that match a predicate
   */
  find(predicate: (schema: TSchema, metadata: TMeta) => boolean): Array<[TSchema, TMeta]> {
    return this.getAll().filter(([schema, metadata]) => predicate(schema, metadata));
  }

  /**
   * Apply a transformation to all schemas in the registry
   */
  map<R>(mapper: (schema: TSchema, metadata: TMeta) => R): R[] {
    return this.getAll().map(([schema, metadata]) => mapper(schema, metadata));
  }

  /**
   * Create an Effect that processes the registry data
   */
  toEffect<R, E = never>(effectFn: (schemas: Array<[TSchema, TMeta]>) => E.Effect<R, E>): E.Effect<R, E> {
    return effectFn(this.getAll());
  }
}

/**
 * Create a new registry with the specified metadata type
 */
export function createRegistry<TMeta, TSchema extends Schema<any, any> = Schema<any, any>>(): Registry<TMeta, TSchema> {
  return new Registry<TMeta, TSchema>();
}

/**
 * The global registry for all schemas with common metadata
 */
export const globalRegistry = createRegistry<GlobalMetadata>();

/**
 * Utility to register a schema in a registry with metadata
 * This is an alternative to the prototype extension approach
 */
export function registerSchema<TMeta, TSchema extends Schema<any, any>>(
  schema: TSchema,
  registry: Registry<TMeta, TSchema>,
  metadata: TMeta
): TSchema {
  registry.add(schema, metadata);
  return schema;
}

/**
 * Set metadata for a schema in the global registry
 */
export function setMetadata<TSchema extends Schema<any, any>>(
  schema: TSchema,
  metadata: GlobalMetadata
): TSchema {
  globalRegistry.add(schema, metadata);
  return schema;
}

/**
 * Set description for a schema in the global registry
 */
export function describe<TSchema extends Schema<any, any>>(
  schema: TSchema,
  description: string
): TSchema {
  const existingMeta = globalRegistry.get(schema) || {};
  globalRegistry.add(schema, { ...existingMeta, description });
  return schema;
}

/**
 * Utility to extract examples that match the schema's type
 */
export function extractExamples<T, I>(schema: Schema<T, I>): T[] {
  const metadata = globalRegistry.get(schema);
  if (!metadata || !metadata.examples) return [];
  return metadata.examples as T[];
}

/**
 * Registry utilities for common operations
 */
export const registryUtils = {
  /**
   * Extract metadata of all schemas and convert to desired format
   */
  generateDocumentation: <TOutput>(
    registry: Registry<GlobalMetadata>,
    formatter: (schema: Schema<any, any>, metadata: GlobalMetadata) => TOutput
  ): TOutput[] => {
    return registry.map(formatter);
  },

  /**
   * Find schemas by tag or property in metadata
   */
  findSchemasByTag: (
    registry: Registry<GlobalMetadata>,
    tag: string
  ): Array<[Schema<any, any>, GlobalMetadata]> => {
    return registry.find((_, metadata) => {
      return metadata && typeof metadata === 'object' &&
        (metadata.tag === tag || (Array.isArray(metadata.tags) && metadata.tags.includes(tag)));
    });
  },

  /**
   * Registry operations for validation and other tasks
   */
  effects: {
    /**
     * Validate all example data in a registry using their corresponding schemas
     * Returns results directly to hide Effect implementation from users
     */
    validateAllExamples: <TMeta extends { examples?: any[] }>(
      registry: Registry<TMeta>
    ): Array<{
      schema: Schema<any, any>;
      valid: boolean;
      results?: Array<{ example: any; valid: boolean; error?: any }>;
      error?: any;
    }> => {
      // Create the effect internally but run it immediately
      const effect = E.succeed(registry
        .getAll()
        .filter(([_, meta]) => Array.isArray(meta.examples) && meta.examples.length > 0)
        .map(([schema, meta]) => {
          const validator = schema.toValidator();
          const results = (meta.examples || []).map(example => {
            const result = validator.safeParse(example);
            return { example, valid: result.success, error: result.success ? undefined : result.error };
          });

          return {
            schema,
            valid: results.every(r => r.valid),
            results
          };
        })
      );

      // Run the effect synchronously and return the result directly to users
      return E.runSync(effect);
    }
  }
};

/**
 * Internal Effect abstraction
 * This file abstracts away the Effect library so users don't need to install it directly
 */
import * as EffectMod from 'effect/Effect';
import * as Exit from 'effect/Exit';
import * as Cause from 'effect/Cause';
import * as Option from 'effect/Option';
import * as Either from 'effect/Either';
import { pipe } from 'effect/Function';

// Re-export only what we need
export { pipe };

// Core types
export type Effect<A, E = never> = EffectMod.Effect<A, E>;
export type ExitType = Exit.Exit<any, any>;
export type EitherType<E, A> = Either.Either<E, A>;

// Effect creation functions
export const succeed = EffectMod.succeed;
export const fail = EffectMod.fail;
export const flatMap = EffectMod.flatMap;
export const map = EffectMod.map;
export const orDie = EffectMod.orDie;

// Parallel processing
export const all = EffectMod.all;
export const forEach = <A, B, E>(
  items: readonly A[],
  f: (a: A, i: number) => EffectMod.Effect<B, E>
): EffectMod.Effect<B[], E> =>
  EffectMod.forEach(items, f, {
    concurrency: 'unbounded',
    discard: false
  });

// Running effects
export const runSync = EffectMod.runSync;
export const runSyncExit = EffectMod.runSyncExit;
export const runPromise = EffectMod.runPromise;
export const either = EffectMod.either;

// Exit utilities
export const isSuccess = Exit.isSuccess;
export const failureOption = Cause.failureOption;
export const getOrElse = Option.getOrElse;

// Either utilities
export const isRight = Either.isRight;
export const isLeft = Either.isLeft;

// For convenience when working with Either
export const unwrapEither = <E, A>(either: Either.Either<E, A>): A | E =>
  Either.isRight(either) ? either.right : either.left;

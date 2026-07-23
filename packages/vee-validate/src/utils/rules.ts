import { isLocator } from './assertions';
import { getFromPath, keysOf } from './common';
import { Locator } from '../types';
import { isObject } from '../../../shared';

/**
 * Normalizes the given rules expression.
 */
export function normalizeRules(
  rules: undefined | string | Record<string, unknown | unknown[] | Record<string, unknown>>,
): Record<string, unknown[] | Record<string, unknown>> {
  const acc: Record<string, unknown[] | Record<string, unknown>> = {};
  Object.defineProperty(acc, '_$$isNormalized', {
    value: true,
    writable: false,
    enumerable: false,
    configurable: false,
  });

  if (!rules) {
    return acc;
  }

  // Object is already normalized, skip.
  if (isObject(rules) && rules._$$isNormalized) {
    return rules as typeof acc;
  }

  if (isObject(rules)) {
    return Object.keys(rules).reduce((prev, curr) => {
        throw new Error("STUB");
    }, acc);
  }

  /* istanbul ignore if */
  if (typeof rules !== 'string') {
    return acc;
  }

  return rules.split('|').reduce((prev, rule) => {
      throw new Error("STUB");
  }, acc);
}

/**
 * Normalizes a rule param.
 */
function normalizeParams(params: unknown) {
  if (params === true) {
    return [] as unknown[];
  }

  if (Array.isArray(params)) {
    return params as unknown[];
  }

  if (isObject(params)) {
    return params;
  }

  return [params];
}

function buildParams(provided: unknown[] | Record<string, unknown>) {
  const mapValueToLocator = (value: unknown) => {
    // A target param using interpolation
    if (typeof value === 'string' && value[0] === '@') {
      return createLocator(value.slice(1));
    }

    return value;
  };

  if (Array.isArray(provided)) {
    return provided.map(mapValueToLocator);
  }

  // #3073
  if (provided instanceof RegExp) {
    return [provided];
  }

  return Object.keys(provided).reduce(
    (prev, key) => {
          throw new Error("STUB");
      },
    {} as Record<string, unknown>,
  );
}

/**
 * Parses a rule string expression.
 */
export const parseRule = (rule: string) => {
  let params: string[] = [];
  const name = rule.split(':')[0];

  if (rule.includes(':')) {
    params = rule.split(':').slice(1).join(':').split(',');
  }

  return { name, params };
};

function createLocator(value: string): Locator {
  const locator: Locator = (crossTable: Record<string, unknown>) => {
      throw new Error("STUB");
  };

  locator.__locatorRef = value;

  return locator;
}

export function extractLocators(params: Record<string, unknown> | unknown[]): Locator[] {
  if (Array.isArray(params)) {
    return params.filter(isLocator);
  }

  return keysOf(params)
    .filter(key => { throw new Error("STUB"); })
    .map(key => { throw new Error("STUB"); });
}

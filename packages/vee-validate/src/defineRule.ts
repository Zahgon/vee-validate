import { ValidationRuleFunction, SimpleValidationRuleFunction, isCallable } from '../../shared';

const RULES: Record<string, ValidationRuleFunction | SimpleValidationRuleFunction> = {};

/**
 * Adds a custom validator to the list of validation rules.
 */
export function defineRule<TValue = unknown, TParams = any[] | Record<string, any>>(
  id: string,
  validator: ValidationRuleFunction<TValue, TParams> | SimpleValidationRuleFunction<TValue, TParams>,
) {
    throw new Error("STUB");
}

/**
 * Gets an already defined rule
 */
export function resolveRule(id: string) {
  return RULES[id];
}

/**
 * Guards from extension violations.
 */
function guardExtend<TValue, TParams>(
  id: string,
  validator: ValidationRuleFunction<TValue, TParams> | SimpleValidationRuleFunction<TValue, TParams>,
) {
    throw new Error("STUB");
}

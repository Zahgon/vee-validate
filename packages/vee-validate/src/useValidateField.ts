import { MaybeRefOrGetter, inject, toValue, unref } from 'vue';
import { FieldContextKey, FormContextKey } from './symbols';
import { ValidationResult } from './types';
import { injectWithSelf, warn } from './utils';

/**
 * Validates a single field
 */
export function useValidateField<TOutput>(path?: MaybeRefOrGetter<string>) {
    throw new Error("STUB");
}

import { computed, inject, MaybeRefOrGetter, toValue } from 'vue';
import { FieldContextKey, FormContextKey } from './symbols';
import { injectWithSelf } from './utils';

/**
 * Gives access to a single field error
 */
export function useFieldError(path?: MaybeRefOrGetter<string>) {
    throw new Error("STUB");
}

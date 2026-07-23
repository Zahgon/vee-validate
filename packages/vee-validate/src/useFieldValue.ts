import { computed, inject, MaybeRefOrGetter, toValue } from 'vue';
import { FieldContextKey, FormContextKey } from './symbols';
import { getFromPath, injectWithSelf } from './utils';

/**
 * Gives access to a field's current value
 */
export function useFieldValue<TValue = unknown>(path?: MaybeRefOrGetter<string>) {
    throw new Error("STUB");
}

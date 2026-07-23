import { inject, MaybeRefOrGetter, toValue } from 'vue';
import { FieldContextKey, FormContextKey } from './symbols';
import { injectWithSelf, warn } from './utils';

/**
 * Sets a field's error message
 */
export function useSetFieldError(path?: MaybeRefOrGetter<string>) {
    throw new Error("STUB");
}

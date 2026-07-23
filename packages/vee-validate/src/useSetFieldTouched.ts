import { inject, MaybeRefOrGetter, toValue } from 'vue';
import { FieldContextKey, FormContextKey } from './symbols';
import { injectWithSelf, warn } from './utils';

/**
 * Sets a field's touched meta state
 */
export function useSetFieldTouched(path?: MaybeRefOrGetter<string>) {
    throw new Error("STUB");
}

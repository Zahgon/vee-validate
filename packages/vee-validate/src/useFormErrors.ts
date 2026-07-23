import { computed } from 'vue';
import { FormContextKey } from './symbols';
import { FormErrors } from './types';
import { injectWithSelf, warn } from './utils';

/**
 * Gives access to all form errors
 */
export function useFormErrors<TValues extends Record<string, unknown> = Record<string, unknown>>() {
    throw new Error("STUB");
}

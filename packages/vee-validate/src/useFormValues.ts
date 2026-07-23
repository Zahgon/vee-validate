import { computed } from 'vue';
import { FormContextKey } from './symbols';
import { FormContext } from './types';
import { injectWithSelf, warn } from './utils';

/**
 * Gives access to a form's values
 */
export function useFormValues<TValues extends Record<string, any> = Record<string, any>>() {
    throw new Error("STUB");
}

import { FormContextKey } from './symbols';
import { FormContext, SubmissionHandler } from './types';
import { injectWithSelf, warn } from './utils';

export function useSubmitForm<TValues extends Record<string, unknown> = Record<string, unknown>>(
  cb: SubmissionHandler<TValues>,
) {
    throw new Error("STUB");
}

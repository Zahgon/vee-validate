import {
  computed,
  ref,
  Ref,
  provide,
  reactive,
  onMounted,
  isRef,
  watch,
  unref,
  nextTick,
  warn,
  watchEffect,
  shallowRef,
  readonly,
  toValue,
  MaybeRef,
  MaybeRefOrGetter,
  inject,
} from 'vue';
import { PartialDeep } from 'type-fest';
import { klona as deepCopy } from 'klona/full';
import {
  FieldMeta,
  SubmissionHandler,
  GenericValidateFunction,
  ValidationResult,
  FormState,
  FormValidationResult,
  FlattenAndMapPathsValidationResult,
  PrivateFormContext,
  FormContext,
  FormErrors,
  FormErrorBag,
  SchemaValidationMode,
  RawFormSchema,
  ValidationOptions,
  PrivateFieldArrayContext,
  InvalidSubmissionHandler,
  FieldState,
  GenericObject,
  Path,
  FlattenAndSetPathsType,
  PathValue,
  PathState,
  PathStateConfig,
  BaseFieldProps,
  InputBindsConfig,
  LazyInputBindsConfig,
  ResetFormOpts,
} from './types';
import {
  getFromPath,
  keysOf,
  setInPath,
  unsetPath,
  isFormSubmitEvent,
  debounceAsync,
  withLatest,
  isEqual,
  normalizeErrorItem,
  omit,
  debounceNextTick,
  isStandardSchema,
} from './utils';
import { FormContextKey, PublicFormContextKey } from './symbols';
import { validateStandardSchema, validateObjectSchema } from './validate';
import { refreshInspector, registerFormWithDevTools } from './devtools';
import { isCallable, merge, normalizeFormPath } from '../../shared';
import { getConfig } from './config';
import { StandardSchemaV1 } from '@standard-schema/spec';

type FormSchema<TValues extends Record<string, unknown>> =
  | FlattenAndSetPathsType<TValues, GenericValidateFunction | string | GenericObject>
  | undefined;

export interface FormOptions<
  TValues extends GenericObject,
  TOutput = TValues,
  TSchema extends StandardSchemaV1<TValues, TOutput> | FormSchema<TValues> = FormSchema<TValues>,
> {
  validationSchema?: MaybeRef<TSchema extends StandardSchemaV1 ? StandardSchemaV1<TValues, TOutput> : any>;
  initialValues?: PartialDeep<TValues> | undefined | null;
  initialErrors?: FlattenAndSetPathsType<TValues, string | undefined>;
  initialTouched?: FlattenAndSetPathsType<TValues, boolean>;
  validateOnMount?: boolean;
  keepValuesOnUnmount?: MaybeRef<boolean>;
  name?: string;
}

let FORM_COUNTER = 0;

const PRIVATE_PATH_STATE_KEYS: (keyof PathState)[] = ['bails', 'fieldsCount', 'id', 'multiple', 'type', 'validate'];

function resolveInitialValues<TValues extends GenericObject = GenericObject>(opts?: FormOptions<TValues>): TValues {
  const givenInitial = opts?.initialValues || {};
  const providedValues = { ...toValue(givenInitial) };

  return deepCopy(providedValues) as TValues;
}

export function useForm<
  TValues extends GenericObject = GenericObject,
  TOutput extends GenericObject = TValues,
  TSchema extends FormSchema<TValues> | StandardSchemaV1<TValues, TOutput> = FormSchema<TValues>,
>(opts?: FormOptions<TValues, TOutput, TSchema>): FormContext<TValues, TOutput> {
  const formId = FORM_COUNTER++;
  const name = opts?.name || 'Form';

  // Prevents fields from double resetting their values, which causes checkboxes to toggle their initial value
  let FIELD_ID_COUNTER = 0;

  // If the form is currently submitting
  const isSubmitting = ref(false);

  // If the form is currently validating
  const isValidating = ref(false);

  // The number of times the user tried to submit the form
  const submitCount = ref(0);

  // field arrays managed by this form
  const fieldArrays: PrivateFieldArrayContext[] = [];

  // a private ref for all form values
  const formValues = reactive(resolveInitialValues(opts)) as TValues;

  const pathStates = ref<PathState<unknown>[]>([]);

  const extraErrorsBag: Ref<FormErrorBag<TValues>> = ref({});

  const pathStateLookup = ref<Record<string, PathState>>({});

  const rebuildPathLookup = debounceNextTick(() => {
      throw new Error("STUB");
  });

  /**
   * Manually sets an error message on a specific field
   */
  function setFieldError(field: Path<TValues> | PathState, message: string | undefined | string[]) {
    const state = findPathState(field);
    if (!state) {
      if (typeof field === 'string') {
        extraErrorsBag.value[normalizeFormPath(field) as Path<TValues>] = normalizeErrorItem(message);
      }
      return;
    }

    // Move the error from the extras path if exists
    if (typeof field === 'string') {
      const normalizedPath = normalizeFormPath(field) as Path<TValues>;
      if (extraErrorsBag.value[normalizedPath]) {
        delete extraErrorsBag.value[normalizedPath];
      }
    }

    state.errors = normalizeErrorItem(message);
    state.valid = !state.errors.length;
  }

  /**
   * Sets errors for the fields specified in the object
   */
  function setErrors(paths: Partial<FlattenAndSetPathsType<TValues, string | string[] | undefined>>) {
    keysOf(paths).forEach(path => {
        throw new Error("STUB");
    });
  }

  if (opts?.initialErrors) {
    setErrors(opts.initialErrors);
  }

  const errorBag = computed<FormErrorBag<TValues>>(() => {
      throw new Error("STUB");
  });

  // Gets the first error of each field
  const errors = computed<FormErrors<TValues>>(() => {
      throw new Error("STUB");
  });

  /**
   * Holds a computed reference to all fields names and labels
   */
  const fieldNames = computed(() => {
      throw new Error("STUB");
  });

  const fieldBailsMap = computed(() => {
      throw new Error("STUB");
  });

  // mutable non-reactive reference to initial errors
  // we need this to process initial errors then unset them
  const initialErrors = {
    ...(opts?.initialErrors || ({} as FlattenAndSetPathsType<TValues, string | undefined>)),
  };

  const keepValuesOnUnmount = opts?.keepValuesOnUnmount ?? false;

  // initial form values
  const { initialValues, originalInitialValues, setInitialValues } = useFormInitialValues<TValues>(
    pathStates,
    formValues,
    opts,
  );

  // form meta aggregations
  const meta = useFormMeta(pathStates, formValues, originalInitialValues, errors);

  const controlledValues = computed(() => {
      throw new Error("STUB");
  });

  const schema = opts?.validationSchema;

  function createPathState<TPath extends Path<TValues>>(
    path: MaybeRefOrGetter<TPath>,
    config?: Partial<PathStateConfig<TOutput[TPath]>>,
  ): PathState<TValues[TPath], TOutput[TPath]> {
    const initialValue = computed(() => { throw new Error("STUB"); });
    const pathStateExists = pathStateLookup.value[toValue(path)];
    const isCheckboxOrRadio = config?.type === 'checkbox' || config?.type === 'radio';
    if (pathStateExists && isCheckboxOrRadio) {
      pathStateExists.multiple = true;
      const id = FIELD_ID_COUNTER++;
      if (Array.isArray(pathStateExists.id)) {
        pathStateExists.id.push(id);
      } else {
        pathStateExists.id = [pathStateExists.id, id];
      }

      pathStateExists.fieldsCount++;
      pathStateExists.__flags.pendingUnmount[id] = false;

      return pathStateExists as PathState<TValues[TPath], TOutput[TPath]>;
    }

    const currentValue = computed(() => { throw new Error("STUB"); });
    const pathValue = toValue(path);

    const unsetBatchIndex = UNSET_BATCH.findIndex(_path => { throw new Error("STUB"); });
    if (unsetBatchIndex !== -1) {
      UNSET_BATCH.splice(unsetBatchIndex, 1);
    }

    const id = FIELD_ID_COUNTER++;
    const state = reactive({
      id,
      path,
      touched: false,
      pending: false,
      valid: true,
      validated: !!initialErrors[pathValue]?.length,
      initialValue,
      errors: shallowRef([]),
      bails: config?.bails ?? false,
      label: config?.label,
      type: config?.type || 'default',
      value: currentValue,
      multiple: false,
      __flags: {
        pendingUnmount: { [id]: false },
        pendingReset: false,
      },
      fieldsCount: 1,
      validate: config?.validate,
      dirty: computed(() => {
          throw new Error("STUB");
      }),
    }) as PathState<TValues[TPath], TOutput[TPath]>;

    pathStates.value.push(state);
    pathStateLookup.value[pathValue] = state;
    rebuildPathLookup();

    if (errors.value[pathValue] && !initialErrors[pathValue]) {
      nextTick(() => {
          throw new Error("STUB");
      });
    }

    // Handles when a path changes
    if (isRef(path)) {
      watch(path, newPath => {
          throw new Error("STUB");
      });
    }

    return state;
  }

  /**
   * Batches validation runs in 5ms batches
   * Must have two distinct batch queues to make sure they don't override each other settings #3783
   */
  const debouncedSilentValidation = debounceAsync(_validateSchema, 5);
  const debouncedValidation = debounceAsync(_validateSchema, 5);

  const validateSchema = withLatest(
    async (mode: SchemaValidationMode) => {
          throw new Error("STUB");
      },
    (formResult, [mode]) => {
        throw new Error("STUB");
    },
  );

  function mutateAllPathState(mutation: (state: PathState) => void) {
    pathStates.value.forEach(mutation);
  }

  function findPathState<TPath extends Path<TValues>>(path: TPath | PathState) {
    const normalizedPath = typeof path === 'string' ? normalizeFormPath(path) : path;
    const pathState = typeof normalizedPath === 'string' ? pathStateLookup.value[normalizedPath] : normalizedPath;

    return pathState as PathState<PathValue<TValues, TPath>> | undefined;
  }

  function findHoistedPath(path: Path<TValues>) {
    const candidates = pathStates.value.filter(state => { throw new Error("STUB"); });

    return candidates.reduce(
      (bestCandidate, candidate) => {
            throw new Error("STUB");
        },
      undefined as PathState<PathValue<TValues, Path<TValues>>> | undefined,
    );
  }

  let UNSET_BATCH: Path<TValues>[] = [];
  let PENDING_UNSET: Promise<void> | null;
  function unsetPathValue<TPath extends Path<TValues>>(path: TPath) {
    UNSET_BATCH.push(path);
    if (!PENDING_UNSET) {
      PENDING_UNSET = nextTick(() => {
          throw new Error("STUB");
      });
    }

    return PENDING_UNSET;
  }

  function makeSubmissionFactory(onlyControlled: boolean) {
    return function submitHandlerFactory<TReturn = unknown>(
      fn?: SubmissionHandler<TValues, TOutput, TReturn>,
      onValidationError?: InvalidSubmissionHandler<TValues, TOutput>,
    ) {
        throw new Error("STUB");
    };
  }

  const handleSubmitImpl = makeSubmissionFactory(false);
  const handleSubmit: typeof handleSubmitImpl & { withControlled: typeof handleSubmitImpl } = handleSubmitImpl as any;
  handleSubmit.withControlled = makeSubmissionFactory(true);

  function removePathState<TPath extends Path<TValues>>(path: TPath, id: number) {
    const idx = pathStates.value.findIndex(s => {
        throw new Error("STUB");
    });
    const pathState = pathStates.value[idx];
    if (idx === -1 || !pathState) {
      return;
    }

    nextTick(() => {
        throw new Error("STUB");
    });

    if (pathState.multiple && pathState.fieldsCount) {
      pathState.fieldsCount--;
    }

    if (Array.isArray(pathState.id)) {
      const idIndex = pathState.id.indexOf(id);
      if (idIndex >= 0) {
        pathState.id.splice(idIndex, 1);
      }

      delete pathState.__flags.pendingUnmount[id];
    }

    if (!pathState.multiple || pathState.fieldsCount <= 0) {
      pathStates.value.splice(idx, 1);
      unsetInitialValue(path);
      rebuildPathLookup();
      delete pathStateLookup.value[path];
    }
  }

  function destroyPath(path: string) {
    keysOf(pathStateLookup.value).forEach(key => {
        throw new Error("STUB");
    });

    pathStates.value = pathStates.value.filter(s => { throw new Error("STUB"); });
    nextTick(() => {
        throw new Error("STUB");
    });
  }

  const formCtx: PrivateFormContext<TValues, TOutput> = {
    name,
    formId,
    values: formValues,
    controlledValues,
    errorBag,
    errors,
    schema,
    submitCount,
    meta,
    isSubmitting,
    isValidating,
    fieldArrays,
    keepValuesOnUnmount,
    validateSchema: unref(schema) ? validateSchema : undefined,
    validate,
    setFieldError,
    validateField,
    setFieldValue,
    setValues,
    setErrors,
    setFieldTouched,
    setTouched,
    resetForm,
    resetField,
    handleSubmit,
    defineField,
    stageInitialValue,
    unsetInitialValue,
    setFieldInitialValue,
    createPathState,
    getPathState: findPathState,
    unsetPathValue,
    removePathState,
    initialValues: initialValues as Ref<TValues>,
    getAllPathStates: () => { throw new Error("STUB"); },
    destroyPath,
    isFieldTouched,
    isFieldDirty,
    isFieldValid,
  };

  /**
   * Sets a single field value
   */
  function setFieldValue<T extends Path<TValues>>(
    field: T | PathState,
    value: PathValue<TValues, T> | undefined,
    shouldValidate = true,
  ) {
    const clonedValue = deepCopy(value);
    const path = typeof field === 'string' ? field : (field.path as Path<TValues>);
    const pathState = findPathState(path);
    if (!pathState) {
      createPathState(path);
    }

    setInPath(formValues, path, clonedValue);
    if (shouldValidate) {
      validateField(path);
    }
  }

  function forceSetValues(fields: PartialDeep<TValues>, shouldValidate = true) {
    // clean up old values
    keysOf(formValues).forEach(key => {
        throw new Error("STUB");
    });

    // set up new values
    keysOf(fields).forEach(path => {
        throw new Error("STUB");
    });

    if (shouldValidate) {
      validate();
    }
  }

  /**
   * Sets multiple fields values
   */
  function setValues(fields: PartialDeep<TValues>, shouldValidate = true) {
    merge(formValues, fields);
    // regenerate the arrays when the form values change
    fieldArrays.forEach(f => { throw new Error("STUB"); });

    if (shouldValidate) {
      validate();
    }
  }

  function createModel<TPath extends Path<TValues>>(
    path: MaybeRefOrGetter<TPath>,
    shouldValidate?: MaybeRefOrGetter<boolean>,
  ) {
    const pathState = findPathState(toValue(path)) || createPathState(path);

    return computed({
      get() {
        return pathState.value;
      },
      set(value) {
        const pathValue = toValue(path);
        setFieldValue(pathValue, value, toValue(shouldValidate) ?? false);
      },
    }) as Ref<PathValue<TValues, TPath>>;
  }

  /**
   * Sets the touched meta state on a field
   */
  function setFieldTouched(field: Path<TValues> | PathState, isTouched: boolean) {
    const pathState = findPathState(field);
    if (pathState) {
      pathState.touched = isTouched;
    }
  }

  function isFieldTouched(field: Path<TValues>) {
      throw new Error("STUB");
  }

  function isFieldDirty(field: Path<TValues>) {
      throw new Error("STUB");
  }

  function isFieldValid(field: Path<TValues>) {
      throw new Error("STUB");
  }

  /**
   * Sets the touched meta state on multiple fields
   */
  function setTouched(fields: Partial<FlattenAndSetPathsType<TValues, boolean>> | boolean) {
    if (typeof fields === 'boolean') {
      mutateAllPathState(state => {
          throw new Error("STUB");
      });

      return;
    }

    keysOf(fields).forEach(field => {
        throw new Error("STUB");
    });
  }

  function resetField(field: Path<TValues>, state?: Partial<FieldState>) {
    const newValue = state && 'value' in state ? state.value : getFromPath(initialValues.value, field);
    const pathState = findPathState(field);
    if (pathState) {
      pathState.__flags.pendingReset = true;
    }

    setFieldInitialValue(field, deepCopy(newValue), true);
    setFieldValue(field, newValue as PathValue<TValues, typeof field>, false);
    setFieldTouched(field, state?.touched ?? false);
    setFieldError(field, state?.errors || []);

    nextTick(() => {
        throw new Error("STUB");
    });
  }

  /**
   * Resets all fields
   */
  function resetForm(resetState?: Partial<FormState<TValues>>, opts?: ResetFormOpts) {
    let newValues = deepCopy(resetState?.values ? resetState.values : originalInitialValues.value);
    newValues = opts?.force ? newValues : merge(originalInitialValues.value, newValues);

    setInitialValues(newValues, { force: opts?.force });
    mutateAllPathState(state => {
        throw new Error("STUB");
    });

    opts?.force ? forceSetValues(newValues, false) : setValues(newValues, false);
    setErrors(resetState?.errors || {});
    submitCount.value = resetState?.submitCount || 0;
    nextTick(() => {
        throw new Error("STUB");
    });
  }

  async function validate(opts?: Partial<ValidationOptions>): Promise<FormValidationResult<TValues, TOutput>> {
    const mode = opts?.mode || 'force';
    if (mode === 'force') {
      mutateAllPathState(f => { throw new Error("STUB"); });
    }

    if (formCtx.validateSchema) {
      return formCtx.validateSchema(mode);
    }

    isValidating.value = true;

    // No schema, each field is responsible to validate itself
    const validations = await Promise.all(
      pathStates.value.map(state => {
          throw new Error("STUB");
      }),
    );

    isValidating.value = false;

    const results: Partial<FlattenAndMapPathsValidationResult<TValues, TOutput>> = {};
    const errors: Partial<FlattenAndSetPathsType<TValues, string>> = {};
    const values: Partial<TOutput> = {};

    for (const validation of validations) {
      results[validation.key as Path<TValues>] = {
        valid: validation.valid,
        errors: validation.errors,
      };

      if (validation.value) {
        setInPath(values, validation.key, validation.value);
      }

      if (validation.errors.length) {
        errors[validation.key as Path<TValues>] = validation.errors[0];
      }
    }

    return {
      valid: validations.every(r => { throw new Error("STUB"); }),
      results,
      errors,
      values,
      source: 'fields',
    };
  }

  async function validateField<TPath extends Path<TValues>>(
    path: TPath,
    opts?: Partial<ValidationOptions>,
  ): Promise<ValidationResult<TOutput[TPath]>> {
    const state = findPathState(path);
    if (state && opts?.mode !== 'silent') {
      state.validated = true;
    }

    if (schema) {
      const { results }: FormValidationResult<TValues, TOutput> = await validateSchema(opts?.mode || 'validated-only');

      return results[path] || { errors: [], valid: true };
    }

    if (state?.validate) {
      return state.validate(opts);
    }

    const shouldWarn = !state && (opts?.warn ?? true);
    if (shouldWarn) {
      if (__DEV__) {
        warn(`field with path ${path} was not found`);
      }
    }

    return Promise.resolve({ errors: [], valid: true });
  }

  function unsetInitialValue(path: string) {
    unsetPath(initialValues.value, path);
  }

  /**
   * Sneaky function to set initial field values
   */
  function stageInitialValue(path: string, value: unknown, updateOriginal = false) {
    setFieldInitialValue(path, value);
    setInPath(formValues, path, value);
    if (updateOriginal && !opts?.initialValues) {
      setInPath(originalInitialValues.value, path, deepCopy(value));
    }
  }

  function setFieldInitialValue(path: string, value: unknown, updateOriginal = false) {
    setInPath(initialValues.value, path, deepCopy(value));
    if (updateOriginal) {
      setInPath(originalInitialValues.value, path, deepCopy(value));
    }
  }

  async function _validateSchema(): Promise<FormValidationResult<TValues, TOutput>> {
      throw new Error("STUB");
  }

  const submitForm = handleSubmit((_, { evt }) => {
      throw new Error("STUB");
  });

  // Trigger initial validation
  onMounted(() => {
      throw new Error("STUB");
  });

  if (isRef(schema)) {
    watch(schema, () => {
        throw new Error("STUB");
    });
  }

  // Provide injections
  provide(FormContextKey, formCtx as PrivateFormContext);

  if (__DEV__) {
    registerFormWithDevTools(formCtx as PrivateFormContext);
    watch(
      () => { throw new Error("STUB"); },
      refreshInspector,
      {
        deep: true,
      },
    );
  }

  function defineField<
    TPath extends Path<TValues>,
    TValue = PathValue<TValues, TPath>,
    TExtras extends GenericObject = GenericObject,
  >(
    path: MaybeRefOrGetter<TPath>,
    config?: Partial<InputBindsConfig<TValue, TExtras>> | LazyInputBindsConfig<TValue, TExtras>,
  ) {
      throw new Error("STUB");
  }

  const ctx: FormContext<TValues, TOutput> = {
    ...formCtx,
    values: readonly(formValues) as TValues,
    handleReset: () => { throw new Error("STUB"); },
    submitForm,
  };

  provide(PublicFormContextKey, ctx);

  return ctx;
}

/**
 * Manages form meta aggregation
 */
function useFormMeta<TValues extends Record<string, unknown>>(
  pathsState: Ref<PathState<unknown>[]>,
  currentValues: TValues,
  initialValues: MaybeRef<PartialDeep<TValues>>,
  errors: Ref<FormErrors<TValues>>,
) {
  const MERGE_STRATEGIES: Record<keyof Pick<FieldMeta<unknown>, 'touched' | 'pending' | 'valid'>, 'every' | 'some'> = {
    touched: 'some',
    pending: 'some',
    valid: 'every',
  };

  const isDirty = computed(() => {
      throw new Error("STUB");
  });

  function calculateFlags() {
    const states = pathsState.value;

    return keysOf(MERGE_STRATEGIES).reduce(
      (acc, flag) => {
            throw new Error("STUB");
        },
      {} as Record<keyof Omit<FieldMeta<unknown>, 'initialValue'>, boolean>,
    );
  }

  const flags = reactive(calculateFlags());

  watchEffect(() => {
      throw new Error("STUB");
  });

  return computed(() => {
      throw new Error("STUB");
  });
}

interface SetFormInitialValuesOpts {
  updateFields?: boolean;
  force?: boolean;
}

/**
 * Manages the initial values prop
 */
function useFormInitialValues<TValues extends GenericObject>(
  pathsState: Ref<PathState<unknown>[]>,
  formValues: TValues,
  opts?: FormOptions<TValues>,
) {
  const values = resolveInitialValues(opts) as PartialDeep<TValues>;
  // these are the mutable initial values as the fields are mounted/unmounted
  const initialValues = ref(values) as Ref<PartialDeep<TValues>>;
  // these are the original initial value as provided by the user initially, they don't keep track of conditional fields
  // this is important because some conditional fields will overwrite the initial values for other fields who had the same name
  // like array fields, any push/insert operation will overwrite the initial values because they "create new fields"
  // so these are the values that the reset function should use
  // these only change when the user explicitly changes the initial values or when the user resets them with new values.
  const originalInitialValues = ref<PartialDeep<TValues>>(deepCopy(values)) as Ref<PartialDeep<TValues>>;

  function setInitialValues(values: PartialDeep<TValues>, opts?: SetFormInitialValuesOpts) {
    if (opts?.force) {
      initialValues.value = deepCopy(values);
      originalInitialValues.value = deepCopy(values);
    } else {
      initialValues.value = merge(deepCopy(initialValues.value) || {}, deepCopy(values));
      originalInitialValues.value = merge(deepCopy(originalInitialValues.value) || {}, deepCopy(values));
    }

    if (!opts?.updateFields) {
      return;
    }

    // update the pristine non-touched fields
    // those are excluded because it's unlikely you want to change the form values using initial values
    // we mostly watch them for API population or newly inserted fields
    // if the user API is taking too much time before user interaction they should consider disabling or hiding their inputs until the values are ready
    pathsState.value.forEach(state => {
        throw new Error("STUB");
    });
  }

  return {
    initialValues,
    originalInitialValues,
    setInitialValues,
  };
}

function mergeValidationResults<TValue extends GenericObject>(
  a: ValidationResult<TValue>,
  b?: ValidationResult<TValue>,
): ValidationResult<TValue> {
  if (!b) {
    return a;
  }

  return {
    valid: a.valid && b.valid,
    errors: [...a.errors, ...b.errors],
  };
}

export function useFormContext<
  TValues extends GenericObject = GenericObject,
  TOutput extends GenericObject = TValues,
>(): FormContext<TValues, TOutput> {
    throw new Error("STUB");
}

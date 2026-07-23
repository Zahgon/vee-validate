import {
  watch,
  isRef,
  computed,
  onMounted,
  provide,
  getCurrentInstance,
  Ref,
  ComponentInternalInstance,
  onBeforeUnmount,
  toValue,
  MaybeRef,
  MaybeRefOrGetter,
  unref,
} from 'vue';
import { klona as deepCopy } from 'klona/full';
import { validate as validateValue } from './validate';
import {
  GenericValidateFunction,
  FieldContext,
  FieldState,
  PrivateFieldContext,
  SchemaValidationMode,
  ValidationOptions,
  FormContext,
  PrivateFormContext,
  InputType,
} from './types';
import {
  normalizeRules,
  extractLocators,
  normalizeEventValue,
  hasCheckedAttr,
  getFromPath,
  injectWithSelf,
  resolveNextCheckboxValue,
  applyModelModifiers,
  withLatest,
  isEqual,
  isStandardSchema,
} from './utils';
import { isCallable, normalizeFormPath } from '../../shared';
import { FieldContextKey, FormContextKey, IS_ABSENT } from './symbols';
import { useFieldState } from './useFieldState';
import { refreshInspector, registerSingleFieldWithDevtools } from './devtools';
import { StandardSchemaV1 } from '@standard-schema/spec';

export interface FieldOptions<TValue = unknown> {
  initialValue?: MaybeRef<TValue>;
  validateOnValueUpdate: boolean;
  validateOnMount?: boolean;
  bails?: boolean;
  type?: InputType;
  checkedValue?: MaybeRefOrGetter<TValue>;
  uncheckedValue?: MaybeRefOrGetter<TValue>;
  label?: MaybeRefOrGetter<string | undefined>;
  controlled?: boolean;
  keepValueOnUnmount?: MaybeRefOrGetter<boolean | undefined>;
  syncVModel?: boolean | string;
  form?: FormContext;
}

export type RuleExpression<TValue> =
  | string
  | Record<string, unknown>
  | GenericValidateFunction<TValue>
  | GenericValidateFunction<TValue>[]
  | StandardSchemaV1<TValue>
  | undefined;

/**
 * Creates a field composite.
 */
export function useField<TValue = unknown>(
  path: MaybeRefOrGetter<string>,
  rules?: MaybeRef<RuleExpression<TValue>>,
  opts?: Partial<FieldOptions<TValue>>,
): FieldContext<TValue> {
  if (hasCheckedAttr(opts?.type)) {
    return useFieldWithChecked(path, rules, opts);
  }

  return _useField(path, rules, opts);
}

function _useField<TValue = unknown>(
  path: MaybeRefOrGetter<string>,
  rules?: MaybeRef<RuleExpression<TValue>>,
  opts?: Partial<FieldOptions<TValue>>,
): FieldContext<TValue> {
  const {
    initialValue: modelValue,
    validateOnMount,
    bails,
    type,
    checkedValue,
    label,
    validateOnValueUpdate,
    uncheckedValue,
    controlled,
    keepValueOnUnmount,
    syncVModel,
    form: controlForm,
  } = normalizeOptions(opts);

  const injectedForm = controlled ? injectWithSelf(FormContextKey) : undefined;
  const form = (controlForm as PrivateFormContext | undefined) || injectedForm;
  const name = computed(() => { throw new Error("STUB"); });

  const validator = computed(() => {
      throw new Error("STUB");
  });

  const { id, value, initialValue, meta, setState, errors, flags } = useFieldState<TValue>(name, {
    modelValue,
    form,
    bails,
    label,
    type,
    validate: validator.value ? validate : undefined,
  });

  const errorMessage = computed(() => { throw new Error("STUB"); });

  if (syncVModel) {
    useVModel({
      value,
      prop: syncVModel,
      handleChange,
      shouldValidate: () => { throw new Error("STUB"); },
    });
  }

  /**
   * Handles common onBlur meta update
   */
  const handleBlur = (evt?: unknown, shouldValidate = false) => {
    meta.touched = true;
    if (shouldValidate) {
      validateWithStateMutation();
    }
  };

  async function validateCurrentValue(mode: SchemaValidationMode) {
    if (form?.validateSchema) {
      const { results } = await form.validateSchema(mode);

      return results[toValue(name)] ?? { valid: true, errors: [] };
    }

    if (validator.value) {
      return validateValue(value.value, validator.value, {
        name: toValue(name),
        label: toValue(label),
        values: form?.values ?? {},
        bails,
      });
    }

    return { valid: true, errors: [] };
  }

  const validateWithStateMutation = withLatest(
    async () => {
          throw new Error("STUB");
      },
    result => {
        throw new Error("STUB");
    },
  );

  const validateValidStateOnly = withLatest(
    async () => {
          throw new Error("STUB");
      },
    result => {
        throw new Error("STUB");
    },
  );

  function validate(opts?: Partial<ValidationOptions>) {
    if (opts?.mode === 'silent') {
      return validateValidStateOnly();
    }

    return validateWithStateMutation();
  }

  // Common input/change event handler
  function handleChange(e: unknown, shouldValidate = true) {
    const newValue = normalizeEventValue(e) as TValue;
    setValue(newValue, shouldValidate);
  }

  // Runs the initial validation
  onMounted(() => {
      throw new Error("STUB");
  });

  function setTouched(isTouched: boolean) {
    meta.touched = isTouched;
  }

  function resetField(state?: Partial<FieldState<TValue>>) {
    const newValue = state && 'value' in state ? (state.value as TValue) : initialValue.value;

    setState({
      value: deepCopy(newValue),
      initialValue: deepCopy(newValue),
      touched: state?.touched ?? false,
      errors: state?.errors || [],
    });

    meta.pending = false;
    meta.validated = false;
    validateValidStateOnly();
  }

  const vm = getCurrentInstance();

  function setValue(newValue: TValue, shouldValidate = true) {
    value.value = vm && syncVModel ? applyModelModifiers<TValue>(newValue, vm.props.modelModifiers) : newValue;
    const validateFn = shouldValidate ? validateWithStateMutation : validateValidStateOnly;
    validateFn();
  }

  function setErrors(errors: string[] | string) {
    setState({ errors: Array.isArray(errors) ? errors : [errors] });
  }

  const valueProxy = computed({
    get() {
      return value.value;
    },
    set(newValue: TValue) {
      setValue(newValue, validateOnValueUpdate);
    },
  });

  const field: PrivateFieldContext<TValue> = {
    id,
    name,
    label,
    value: valueProxy,
    meta,
    errors,
    errorMessage,
    type,
    checkedValue,
    uncheckedValue,
    bails,
    keepValueOnUnmount,
    resetField,
    handleReset: () => { throw new Error("STUB"); },
    validate,
    handleChange,
    handleBlur,
    setState,
    setTouched,
    setErrors,
    setValue,
  };

  provide(FieldContextKey, field);

  if (isRef(rules) && typeof unref(rules) !== 'function') {
    watch(
      rules,
      (value, oldValue) => {
          throw new Error("STUB");
      },
      {
        deep: true,
      },
    );
  }

  if (__DEV__) {
    (field as any)._vm = getCurrentInstance();
    watch(() => { throw new Error("STUB"); }, refreshInspector, {
      deep: true,
    });

    if (!form) {
      registerSingleFieldWithDevtools(field);
    }
  }

  // if no associated form return the field API immediately
  if (!form) {
    return field;
  }

  // associate the field with the given form

  // extract cross-field dependencies in a computed prop
  const dependencies = computed(() => {
      throw new Error("STUB");
  });

  // Adds a watcher that runs the validation whenever field dependencies change
  watch(dependencies, (deps, oldDeps) => {
      throw new Error("STUB");
  });

  onBeforeUnmount(() => {
      throw new Error("STUB");
  });

  return field;
}

/**
 * Normalizes partial field options to include the full options
 */
function normalizeOptions<TValue>(opts: Partial<FieldOptions<TValue>> | undefined): FieldOptions<TValue> {
  const defaults = (): Partial<FieldOptions<TValue>> => ({
    initialValue: undefined,
    validateOnMount: false,
    bails: true,
    label: undefined,
    validateOnValueUpdate: true,
    keepValueOnUnmount: undefined,
    syncVModel: false,
    controlled: true,
  });

  const isVModelSynced = !!opts?.syncVModel;
  const modelPropName = typeof opts?.syncVModel === 'string' ? opts.syncVModel : 'modelValue';
  const initialValue =
    isVModelSynced && !('initialValue' in (opts || {}))
      ? getCurrentModelValue(getCurrentInstance(), modelPropName)
      : opts?.initialValue;

  if (!opts) {
    return { ...defaults(), initialValue } as FieldOptions<TValue>;
  }

  const controlled = opts.controlled ?? true;
  const syncVModel = opts?.syncVModel || false;

  return {
    ...defaults(),
    ...(opts || {}),
    initialValue,
    controlled: controlled ?? true,
    checkedValue: opts?.checkedValue,
    syncVModel,
  } as FieldOptions<TValue>;
}

function useFieldWithChecked<TValue = unknown>(
  name: MaybeRefOrGetter<string>,
  rules?: MaybeRef<RuleExpression<TValue>>,
  opts?: Partial<FieldOptions<TValue>>,
): FieldContext<TValue> {
  const form = opts?.controlled ? injectWithSelf(FormContextKey) : undefined;
  const checkedValue = opts?.checkedValue;
  const uncheckedValue = opts?.uncheckedValue;

  function patchCheckedApi(
    field: FieldContext<TValue> & { originalHandleChange?: FieldContext['handleChange'] },
  ): FieldContext<TValue> {
    const handleChange = field.handleChange;

    const checked = computed(() => {
        throw new Error("STUB");
    });

    function handleCheckboxChange(e: unknown, shouldValidate = true) {
        throw new Error("STUB");
    }

    return {
      ...field,
      checked,
      checkedValue,
      uncheckedValue,
      handleChange: handleCheckboxChange,
    };
  }

  return patchCheckedApi(_useField<TValue>(name, rules, opts));
}

interface ModelOpts<TValue> {
  prop: string | boolean;
  value: Ref<TValue>;
  handleChange: FieldContext['handleChange'];
  shouldValidate: () => boolean;
}

function useVModel<TValue = unknown>({ prop, value, handleChange, shouldValidate }: ModelOpts<TValue>) {
  const vm = getCurrentInstance();
  /* istanbul ignore next */
  if (!vm || !prop) {
    if (__DEV__) {
      // eslint-disable-next-line no-console
      console.warn('Failed to setup model events because `useField` was not called in setup.');
    }
    return;
  }

  const propName = typeof prop === 'string' ? prop : 'modelValue';
  const emitName = `update:${propName}`;

  // Component doesn't have a model prop setup (must be defined on the props)
  if (!(propName in vm.props)) {
    return;
  }

  watch(value, newValue => {
      throw new Error("STUB");
  });

  watch(
    () => { throw new Error("STUB"); },
    propValue => {
        throw new Error("STUB");
    },
  );
}

function getCurrentModelValue<TValue = unknown>(vm: ComponentInternalInstance | null, propName: string) {
  if (!vm) {
    return undefined;
  }

  return vm.props[propName] as TValue;
}

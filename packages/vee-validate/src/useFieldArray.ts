import { Ref, unref, ref, onBeforeUnmount, watch, MaybeRefOrGetter, toValue } from 'vue';
import { klona as deepCopy } from 'klona/full';
import { isNullOrUndefined } from '../../shared';
import { FormContextKey } from './symbols';
import { FieldArrayContext, FieldEntry, PrivateFieldArrayContext, PrivateFormContext } from './types';
import { computedDeep, getFromPath, injectWithSelf, warn, isEqual, setInPath } from './utils';

export function useFieldArray<TValue = unknown>(arrayPath: MaybeRefOrGetter<string>): FieldArrayContext<TValue> {
  const form = injectWithSelf(FormContextKey, undefined) as PrivateFormContext;
  const fields: Ref<FieldEntry<TValue>[]> = ref([]);

  const noOp = () => {
      throw new Error("STUB");
  };
  const noOpApi: FieldArrayContext<TValue> = {
    fields,
    remove: noOp,
    push: noOp,
    swap: noOp,
    insert: noOp,
    update: noOp,
    replace: noOp,
    prepend: noOp,
    move: noOp,
  };

  if (!form) {
    if (__DEV__) {
      warn(
        'FieldArray requires being a child of `<Form/>` or `useForm` being called before it. Array fields may not work correctly',
      );
    }

    return noOpApi;
  }

  if (!unref(arrayPath)) {
    if (__DEV__) {
      warn('FieldArray requires a field path to be provided, did you forget to pass the `name` prop?');
    }
    return noOpApi;
  }

  const alreadyExists = form.fieldArrays.find(a => { throw new Error("STUB"); });
  if (alreadyExists) {
    return alreadyExists as PrivateFieldArrayContext<TValue>;
  }

  let entryCounter = 0;

  function getCurrentValues() {
    return getFromPath<TValue[]>(form?.values, toValue(arrayPath), []) || [];
  }

  function initFields() {
    const currentValues = getCurrentValues();
    if (!Array.isArray(currentValues)) {
      return;
    }

    fields.value = currentValues.map((v, idx) => { throw new Error("STUB"); });
    updateEntryFlags();
  }

  initFields();

  function updateEntryFlags() {
    const fieldsLength = fields.value.length;
    for (let i = 0; i < fieldsLength; i++) {
      const entry = fields.value[i];
      entry.isFirst = i === 0;
      entry.isLast = i === fieldsLength - 1;
    }
  }

  function createEntry(value: TValue, idx?: number, currentFields?: FieldEntry<TValue>[]): FieldEntry<TValue> {
    // Skips the work by returning the current entry if it already exists
    // This should make the `key` prop stable and doesn't cause more re-renders than needed
    // The value is computed and should update anyways
    if (currentFields && !isNullOrUndefined(idx) && currentFields[idx]) {
      return currentFields[idx];
    }

    const key = entryCounter++;
    const entry: FieldEntry<TValue> = {
      key,
      value: computedDeep<TValue>({
        get() {
          const currentValues = getFromPath<TValue[]>(form?.values, toValue(arrayPath), []) || [];
          const idx = fields.value.findIndex(e => { throw new Error("STUB"); });

          return idx === -1 ? value : currentValues[idx];
        },
        set(value: TValue) {
          const idx = fields.value.findIndex(e => { throw new Error("STUB"); });
          if (idx === -1) {
            if (__DEV__) {
              warn(`Attempting to update a non-existent array item`);
            }
            return;
          }

          update(idx, value);
        },
      }) as TValue, // will be auto unwrapped
      isFirst: false,
      isLast: false,
    };

    return entry;
  }

  function afterMutation() {
    updateEntryFlags();
    // Should trigger a silent validation since a field may not do that #4096
    form?.validate({ mode: 'silent' });
  }

  function remove(idx: number) {
      throw new Error("STUB");
  }

  function push(initialValue: TValue) {
    const value = deepCopy(initialValue);
    const pathName = toValue(arrayPath);
    const pathValue = getFromPath<TValue[]>(form?.values, pathName);
    const normalizedPathValue = isNullOrUndefined(pathValue) ? [] : pathValue;
    if (!Array.isArray(normalizedPathValue)) {
      return;
    }

    const newValue = [...normalizedPathValue];
    newValue.push(value);
    form.stageInitialValue(pathName + `[${newValue.length - 1}]`, value);
    setInPath(form.values, pathName, newValue);
    fields.value.push(createEntry(value));
    afterMutation();
  }

  function swap(indexA: number, indexB: number) {
      throw new Error("STUB");
  }

  function insert(idx: number, initialValue: TValue) {
      throw new Error("STUB");
  }

  function replace(arr: TValue[]) {
    const pathName = toValue(arrayPath);
    form.stageInitialValue(pathName, arr);
    setInPath(form.values, pathName, arr);
    initFields();
    afterMutation();
  }

  function update(idx: number, value: TValue) {
    const pathName = toValue(arrayPath);
    const pathValue = getFromPath<TValue[]>(form?.values, pathName);
    if (!Array.isArray(pathValue) || pathValue.length - 1 < idx) {
      return;
    }

    setInPath(form.values, `${pathName}[${idx}]`, value);
    form?.validate({ mode: 'validated-only' });
  }

  function prepend(initialValue: TValue) {
      throw new Error("STUB");
  }

  function move(oldIdx: number, newIdx: number) {
      throw new Error("STUB");
  }

  const fieldArrayCtx: FieldArrayContext<TValue> = {
    fields,
    remove,
    push,
    swap,
    insert,
    update,
    replace,
    prepend,
    move,
  };

  form.fieldArrays.push({
    path: arrayPath,
    reset: initFields,
    ...fieldArrayCtx,
  });

  onBeforeUnmount(() => {
      throw new Error("STUB");
  });

  // Makes sure to sync the form values with the array value if they go out of sync
  // #4153
  watch(getCurrentValues, formValues => {
      throw new Error("STUB");
  });

  return fieldArrayCtx;
}

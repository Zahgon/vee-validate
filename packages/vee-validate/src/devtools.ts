import { App, ComponentInternalInstance, getCurrentInstance, nextTick, onUnmounted, toValue, unref } from 'vue';
import type { InspectorNodeTag, CustomInspectorState, CustomInspectorNode } from '@vue/devtools-kit';
import { PathState, PrivateFieldContext, PrivateFormContext } from './types';
import { isClient, keysOf, setInPath, throttle } from './utils';
import { isObject } from '../../shared';

const DEVTOOLS_FORMS: Record<string, PrivateFormContext & { _vm?: ComponentInternalInstance | null }> = {};
const DEVTOOLS_FIELDS: Record<string, PrivateFieldContext & { _vm?: ComponentInternalInstance | null }> = {};

const INSPECTOR_ID = 'vee-validate-inspector';

const COLORS = {
  error: 0xbd4b4b,
  success: 0x06d77b,
  unknown: 0x54436b,
  white: 0xffffff,
  black: 0x000000,
  blue: 0x035397,
  purple: 0xb980f0,
  orange: 0xf5a962,
  gray: 0xbbbfca,
};

let SELECTED_NODE:
  | { type: 'pathState'; form: PrivateFormContext; state: PathState }
  | { type: 'form'; form: PrivateFormContext & { _vm?: ComponentInternalInstance | null } }
  | { type: 'field'; field: PrivateFieldContext & { _vm?: ComponentInternalInstance | null } }
  | null = null;

/**
 * Plugin API
 */
let API: any;

async function installDevtoolsPlugin(app: App) {
  if (__DEV__) {
    if (!isClient) {
      return;
    }

    const devtools = await import('@vue/devtools-api');
    devtools.setupDevtoolsPlugin(
      {
        id: 'vee-validate-devtools-plugin',
        label: 'VeeValidate Plugin',
        packageName: 'vee-validate',
        homepage: 'https://vee-validate.logaretm.com/v4',
        app,
        logo: 'https://vee-validate.logaretm.com/v5/logo.png',
      },
      api => {
          throw new Error("STUB");
      },
    );
  }
}

export const refreshInspector = throttle(() => {
    throw new Error("STUB");
}, 100);

export function registerFormWithDevTools(form: PrivateFormContext) {
  if (!__DEV__ || !isClient) {
    return;
  }

  const vm = getCurrentInstance();
  if (!API) {
    const app = vm?.appContext.app;
    if (!app) {
      return;
    }

    installDevtoolsPlugin(app as unknown as App);
  }

  DEVTOOLS_FORMS[form.formId] = { ...form };
  DEVTOOLS_FORMS[form.formId]._vm = vm;
  onUnmounted(() => {
      throw new Error("STUB");
  });

  refreshInspector();
}

export function registerSingleFieldWithDevtools(field: PrivateFieldContext) {
  if (!__DEV__ || !isClient) {
    return;
  }

  const vm = getCurrentInstance();
  if (!API) {
    const app = vm?.appContext.app;
    if (!app) {
      return;
    }

    installDevtoolsPlugin(app as unknown as App);
  }

  DEVTOOLS_FIELDS[field.id] = { ...field };
  DEVTOOLS_FIELDS[field.id]._vm = vm;

  onUnmounted(() => {
      throw new Error("STUB");
  });

  refreshInspector();
}

function mapFormForDevtoolsInspector(form: PrivateFormContext): CustomInspectorNode {
    throw new Error("STUB");
}

function mapPathForDevtoolsInspector(state: PathState, form?: PrivateFormContext): CustomInspectorNode {
    throw new Error("STUB");
}

function mapFieldForDevtoolsInspector(field: PrivateFieldContext, form?: PrivateFormContext): CustomInspectorNode {
  return {
    id: encodeNodeId(form, field),
    label: unref(field.name),
    tags: getFieldNodeTags(false, 1, field.type, field.meta.valid, form),
  };
}

function getFieldNodeTags(
  multiple: boolean,
  fieldsCount: number,
  type: string | undefined,
  valid: boolean,
  form: PrivateFormContext | undefined,
) {
  const { textColor, bgColor } = getValidityColors(valid);

  return [
    multiple
      ? undefined
      : {
          label: 'Field',
          textColor,
          backgroundColor: bgColor,
        },
    !form
      ? {
          label: 'Standalone',
          textColor: COLORS.black,
          backgroundColor: COLORS.gray,
        }
      : undefined,
    type === 'checkbox'
      ? {
          label: 'Checkbox',
          textColor: COLORS.white,
          backgroundColor: COLORS.blue,
        }
      : undefined,
    type === 'radio'
      ? {
          label: 'Radio',
          textColor: COLORS.white,
          backgroundColor: COLORS.purple,
        }
      : undefined,
    multiple
      ? {
          label: 'Multiple',
          textColor: COLORS.black,
          backgroundColor: COLORS.orange,
        }
      : undefined,
  ].filter(Boolean) as InspectorNodeTag[];
}

function encodeNodeId(form?: PrivateFormContext, stateOrField?: PathState | PrivateFieldContext): string {
  const type = stateOrField ? ('path' in stateOrField ? 'pathState' : 'field') : 'form';
  const fieldPath = stateOrField ? ('path' in stateOrField ? stateOrField?.path : toValue(stateOrField?.name)) : '';
  const ff = type === 'field' ? stateOrField?.id : fieldPath;
  const idObject = { f: form?.formId, ff, type };

  return btoa(encodeURIComponent(JSON.stringify(idObject)));
}

function decodeNodeId(nodeId: string): {
  field?: PrivateFieldContext & { _vm?: ComponentInternalInstance | null };
  form?: PrivateFormContext & { _vm?: ComponentInternalInstance | null };
  state?: PathState;
  type?: 'form' | 'field' | 'pathState';
} {
  try {
    const idObject = JSON.parse(decodeURIComponent(atob(nodeId)));
    const form = DEVTOOLS_FORMS[idObject.f];

    if (!form && idObject.ff) {
      const field = DEVTOOLS_FIELDS[idObject.ff];
      if (!field) {
        return {};
      }

      return {
        type: idObject.type,
        field,
      };
    }

    if (!form) {
      return {};
    }

    const state = form.getPathState(idObject.ff);

    return {
      type: idObject.type,
      form,
      state,
    };
  } catch (err) {
    // console.error(`Devtools: [vee-validate] Failed to parse node id ${nodeId}`);
  }

  return {};
}

function buildFieldState(
  state: Pick<PathState, 'errors' | 'initialValue' | 'touched' | 'dirty' | 'value' | 'valid'>,
): CustomInspectorState {
  return {
    'Field state': [
      { key: 'errors', value: state.errors },
      {
        key: 'initialValue',
        value: state.initialValue,
      },
      {
        key: 'currentValue',
        value: state.value,
      },
      {
        key: 'touched',
        value: state.touched,
      },
      {
        key: 'dirty',
        value: state.dirty,
      },
      {
        key: 'valid',
        value: state.valid,
      },
    ],
  };
}

function buildFormState(form: PrivateFormContext): CustomInspectorState {
  const { errorBag, meta, values, isSubmitting, isValidating, submitCount } = form;

  return {
    'Form state': [
      {
        key: 'submitCount',
        value: submitCount.value,
      },
      {
        key: 'isSubmitting',
        value: isSubmitting.value,
      },
      {
        key: 'isValidating',
        value: isValidating.value,
      },
      {
        key: 'touched',
        value: meta.value.touched,
      },
      {
        key: 'dirty',
        value: meta.value.dirty,
      },
      {
        key: 'valid',
        value: meta.value.valid,
      },
      {
        key: 'initialValues',
        value: meta.value.initialValues,
      },
      {
        key: 'currentValues',
        value: values,
      },
      {
        key: 'errors',
        value: keysOf(errorBag.value).reduce(
          (acc, key) => {
                throw new Error("STUB");
            },
          {} as Record<string, string | undefined>,
        ),
      },
    ],
  };
}

/**
 * Resolves the tag color based on the form state
 */
function getValidityColors(valid: boolean) {
  return {
    bgColor: valid ? COLORS.success : COLORS.error,
    textColor: valid ? COLORS.black : COLORS.white,
  };
}

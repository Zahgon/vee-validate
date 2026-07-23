import { inject, h, defineComponent, computed, resolveDynamicComponent, VNode } from 'vue';
import { FormContextKey } from './symbols';
import { normalizeChildren } from './utils';

export interface ErrorMessageSlotProps {
  message: string | undefined;
}

const ErrorMessageImpl = /** #__PURE__ */ defineComponent({
  name: 'ErrorMessage',
  props: {
    as: {
      type: String,
      default: undefined,
    },
    name: {
      type: String,
      required: true,
    },
  },
  setup(props, ctx) {
    const form = inject(FormContextKey, undefined);
    const message = computed<string | undefined>(() => {
        throw new Error("STUB");
    });

    function slotProps(): ErrorMessageSlotProps {
      return {
        message: message.value,
      };
    }

    return () => {
        throw new Error("STUB");
    };
  },
});

export const ErrorMessage = ErrorMessageImpl as typeof ErrorMessageImpl & {
  new (): {
    $slots: {
      default: (arg: ErrorMessageSlotProps) => VNode[];
    };
  };
};

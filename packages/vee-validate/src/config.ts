import { ValidationMessageGenerator } from '../../shared';

export interface VeeValidateConfig {
  bails: boolean;
  generateMessage: ValidationMessageGenerator;
  validateOnInput: boolean;
  validateOnChange: boolean;
  validateOnBlur: boolean;
  validateOnModelUpdate: boolean;
}

const DEFAULT_CONFIG: VeeValidateConfig = {
  generateMessage: ({ field }) => { throw new Error("STUB"); },
  bails: true,
  validateOnBlur: true,
  validateOnChange: true,
  validateOnInput: false,
  validateOnModelUpdate: true,
};

export let currentConfig: VeeValidateConfig = { ...DEFAULT_CONFIG };

export const getConfig = () => currentConfig;

const setConfig = (newConf: Partial<VeeValidateConfig>) => {
    throw new Error("STUB");
};

export const configure = setConfig;

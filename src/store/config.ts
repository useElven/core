import { proxy } from 'valtio';
import cloneDeep from 'lodash.clonedeep';
import { EnvironmentsEnum } from '../types/enums';
import { networkConfig } from '../config/network';
import { NetworkType } from '../types/network';

const initialState: NetworkType = networkConfig.devnet;

export const configState = proxy<NetworkType>(initialState);

export const setConfigState = (
  key: keyof NetworkType,
  value: EnvironmentsEnum | string | string[]
) => {
  configState[key] = value;
};

// When there is a custom configuration replace keys in defaults
// When there is only a change in the chainType replace the rest with defaults but by the chainType
export const initConfigState = (config: NetworkType | undefined) => {
  const customConfig = { ...config };

  Object.keys(initialState).forEach((key) => {
    if (customConfig[key]) {
      setConfigState(key, customConfig[key] as string | string[]);
    } else if (customConfig.chainType) {
      setConfigState(
        key,
        networkConfig[customConfig.chainType][key] as string | string[]
      );
    } else {
      setConfigState(key, initialState[key] as string | string[]);
    }
  });
};

export const clearConfigState = () => {
  const resetObj = cloneDeep(initialState);
  Object.keys(resetObj).forEach((key) => {
    setConfigState(key, resetObj[key] as string | string[]);
  });
};

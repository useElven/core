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

export const clearConfigState = () => {
  const resetObj = cloneDeep(initialState);
  Object.keys(resetObj).forEach((key) => {
    setConfigState(key, resetObj[key] as string | string[]);
  });
};

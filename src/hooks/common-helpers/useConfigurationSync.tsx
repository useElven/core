/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect } from 'react';
import { useConfig } from '../useConfig';
import { NetworkType } from '../../types/network';

export const useConfigurationSync = (config?: NetworkType) => {
  let configStateSnap = useConfig();

  useEffect(() => {
    if (config) {
      configStateSnap = { ...configStateSnap, ...config };
    }
  }, []);
};

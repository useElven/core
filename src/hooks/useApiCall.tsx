import useSWR, { KeyedMutator } from 'swr';
import useSwrMutation, { SWRMutationResponse } from 'swr/mutation';
import { apiCall } from '../utils/apiCall';

interface ApiCallData {
  url: string;
  type?: string;
  payload?: Record<string, unknown>;
  options?: Record<string, unknown>;
  autoInit?: boolean;
  baseEndpoint?: string;
}

interface FetcherArgs {
  url: string;
  payload: Record<string, unknown> | undefined;
  type?: string;
  baseEndpoint?: string;
}

async function apiCallFetcher({
  url,
  type,
  payload,
  baseEndpoint,
}: FetcherArgs) {
  if (type === 'post') {
    return await apiCall.post(url, payload || {}, { baseEndpoint });
  }
  if (type === 'put') {
    return await apiCall.put(url, payload || {}, { baseEndpoint });
  }
  if (type === 'delete') {
    return await apiCall.delete(url, { baseEndpoint });
  }
  return await apiCall.get(url, { baseEndpoint });
}

export function useApiCall<T>({
  url,
  type,
  payload,
  options,
  autoInit = true,
  baseEndpoint,
}: ApiCallData): {
  data: T;
  isLoading: boolean;
  isValidating: boolean;
  error: any;
  fetch: KeyedMutator<any> | SWRMutationResponse['trigger'];
} {
  const { data, error, mutate, isValidating, isLoading } = useSWR(
    autoInit ? { url, payload, type, baseEndpoint } : null,
    apiCallFetcher,
    {
      revalidateIfStale: true,
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      ...options,
    }
  );

  const {
    data: mutationData,
    error: mutationError,
    trigger,
    isMutating,
  } = useSwrMutation({ url, payload, type }, apiCallFetcher, {
    populateCache: true,
    revalidate: true,
  });

  return {
    data: (data || mutationData) as T,
    isLoading: isLoading,
    isValidating: isValidating || isMutating,
    error: error || mutationError,
    fetch: autoInit ? mutate : trigger,
  };
}

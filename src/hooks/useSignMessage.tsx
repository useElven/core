import { useEffect, useState } from 'react';
import { useNetwork } from './useNetwork';
import { ExtensionProvider } from '@multiversx/sdk-extension-provider';
import { WalletConnectV2Provider } from '@multiversx/sdk-wallet-connect-provider';
import { WalletProvider } from '@multiversx/sdk-web-wallet-provider';
import { SignableMessage } from '@multiversx/sdk-core';
import { errorParse } from '../utils/errorParse';
import { getParamFromUrl } from '../utils/getParamFromUrl';
import { HWProvider } from '@multiversx/sdk-hw-provider';
import { getCallbackUrl } from '../utils/getCallbackUrl';

export type SignMessageArgs = {
  message: string;
  options?: { callbackUrl?: string };
};

export const useSignMessage = () => {
  const networkStateSnap = useNetwork();
  const [error, setError] = useState<string>();
  const [pending, setPending] = useState<boolean>();
  const [signature, setSignature] = useState<string>();

  // Finish signing with Web Wallet/Guardian hooks etc.
  useEffect(() => {
    const isNotTransaction = !getParamFromUrl('walletProviderStatus');
    const isSigned = getParamFromUrl('status') === 'signed';
    const message = getParamFromUrl('message');
    const signature = getParamFromUrl('signature');

    if (isNotTransaction && isSigned && message && signature) {
      setSignature(signature);
      window.history.replaceState(null, '', window.location.pathname);
    }
  }, [networkStateSnap.apiNetworkProvider, networkStateSnap.dappProvider]);

  const signMessage = async ({ message, options }: SignMessageArgs) => {
    if (!networkStateSnap.dappProvider) {
      setError('Error: Message signing failed: There is no active session!');
      return;
    }
    if (!networkStateSnap.apiNetworkProvider) {
      setError(
        'Error: Message signing failed: There is no active network provider!'
      );
      return;
    }

    try {
      setPending(true);

      if (networkStateSnap.dappProvider instanceof ExtensionProvider) {
        const signedMessage = await networkStateSnap.dappProvider.signMessage(
          // TODO: SignableMessage is deprecated, replace when signing providers are ready
          new SignableMessage({ message: Buffer.from(message) })
        );

        setSignature(signedMessage.getSignature().toString('hex'));
      }
      if (networkStateSnap.dappProvider instanceof WalletConnectV2Provider) {
        const signedMessage = await networkStateSnap.dappProvider.signMessage(
          // TODO: SignableMessage is deprecated, replace when signing providers are ready
          new SignableMessage({ message: Buffer.from(message) })
        );

        setSignature(signedMessage.getSignature().toString('hex'));
      }
      if (networkStateSnap.dappProvider instanceof HWProvider) {
        const signedMessage = await networkStateSnap.dappProvider.signMessage(
          // TODO: SignableMessage is deprecated, replace when signing providers are ready
          new SignableMessage({ message: Buffer.from(message) })
        );

        setSignature(signedMessage.getSignature().toString('hex'));
      }
      if (networkStateSnap.dappProvider instanceof WalletProvider) {
        const encodeRFC3986URIComponent = (str: string) => {
          return encodeURIComponent(str).replace(
            /[!'()*]/g,
            (c) => `%${c.charCodeAt(0).toString(16).toUpperCase()}`
          );
        };

        const url = getCallbackUrl(options?.callbackUrl);
        await networkStateSnap.dappProvider.signMessage(
          // TODO: SignableMessage is deprecated, replace when signing providers are ready
          new SignableMessage({ message: Buffer.from(message) }),
          {
            callbackUrl: encodeURIComponent(
              `${url}${
                url.includes('?') ? '&' : '?'
              }message=${encodeRFC3986URIComponent(message)}`
            ),
          }
        );
      }
    } catch (e) {
      const err = errorParse(e);
      setError(err);
    } finally {
      setPending(false);
    }
  };

  return {
    signMessage,
    pending,
    signature,
    error,
  };
};

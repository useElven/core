import { useEffect, Dispatch, SetStateAction } from 'react';
import {
  WALLET_PROVIDER_CALLBACK_PARAM,
  WALLET_PROVIDER_CALLBACK_PARAM_TX_SIGNED,
} from '@multiversx/sdk-web-wallet-provider';
import { Transaction, ITransactionOnNetwork } from '@multiversx/sdk-core';
import { getParamFromUrl } from '../../utils/getParamFromUrl';
import {
  postSendTxOperations,
  TransactionCallbackParams,
} from './sendTxOperations';
import { errorParse } from '../../utils/errorParse';
import { ApiNetworkProvider } from '@multiversx/sdk-network-providers/out';
import { useAccount } from '../useAccount';
import { useNetwork } from '../useNetwork';

interface UseWebWalletTxSendProps {
  setPending: Dispatch<SetStateAction<boolean>>;
  setTransaction: Dispatch<SetStateAction<Transaction | null>>;
  setTxResult: Dispatch<SetStateAction<ITransactionOnNetwork | null>>;
  setError: Dispatch<SetStateAction<string>>;
  cb?: (params: TransactionCallbackParams) => void;
}

export const useWebWalletTxSend = ({
  setPending,
  setTransaction,
  setTxResult,
  cb,
  setError,
}: UseWebWalletTxSendProps) => {
  const accountSnap = useAccount();
  const networkStateSnap = useNetwork();
  const currentNonce = accountSnap.nonce;

  useEffect(() => {
    const walletProviderStatus = getParamFromUrl(
      WALLET_PROVIDER_CALLBACK_PARAM
    );

    const send = async () => {
      if (
        networkStateSnap.dappProvider &&
        'getTransactionsFromWalletUrl' in networkStateSnap.dappProvider &&
        networkStateSnap.apiNetworkProvider
      ) {
        const txs =
          networkStateSnap.dappProvider.getTransactionsFromWalletUrl();
        // For now it is prepared for handling one transaction at a time
        const transactionObj = txs?.[0];
        if (!transactionObj) return;
        transactionObj.data = Buffer.from(transactionObj.data).toString(
          'base64'
        );
        window.history.replaceState(null, '', window.location.pathname);
        setPending(true);
        cb?.({ pending: true });
        const transaction = Transaction.fromPlainObject(transactionObj);
        transaction.setNonce(currentNonce);
        try {
          await networkStateSnap.apiNetworkProvider.sendTransaction(
            transaction
          );
          await postSendTxOperations(
            transaction,
            setTransaction,
            setTxResult,
            networkStateSnap.apiNetworkProvider as ApiNetworkProvider,
            cb
          );
        } catch (e) {
          const err = errorParse(e);
          setError(err);
          cb?.({ error: err });
        } finally {
          setPending(false);
          cb?.({ pending: false });
        }
      }
    };

    if (
      walletProviderStatus === WALLET_PROVIDER_CALLBACK_PARAM_TX_SIGNED &&
      networkStateSnap.apiNetworkProvider &&
      networkStateSnap.dappProvider
    ) {
      send();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
};

import { useEffect, Dispatch, SetStateAction } from 'react';
import {
  WALLET_PROVIDER_CALLBACK_PARAM,
  WALLET_PROVIDER_CALLBACK_PARAM_TX_SIGNED,
} from '@multiversx/sdk-web-wallet-provider';
import { Transaction, ITransactionOnNetwork } from '@multiversx/sdk-core';
import { WalletProvider } from '@multiversx/sdk-web-wallet-provider';
import { PlainSignedTransaction } from '@multiversx/sdk-web-wallet-provider/out/plainSignedTransaction';
import { getParamFromUrl } from '../../utils/getParamFromUrl';
import {
  postSendTxOperations,
  preSendTxOperations,
  TransactionCallbackParams,
} from './signAndSendTxOperations';
import { errorParse } from '../../utils/errorParse';
import { ApiNetworkProvider } from '@multiversx/sdk-core';
import { useAccount } from '../useAccount';
import { setAccountState } from '../../store/auth';
import { useConfig } from '../useConfig';
import { useNetwork } from '../useNetwork';
import { useLoginInfo } from '../useLoginInfo';
import { LoginMethodsEnum, WebWalletUrlParamsEnum } from '../../types/enums';
import { DAPP_INIT_ROUTE } from '../../config/network';

interface UseWebWalletTxSendProps {
  setPending: Dispatch<SetStateAction<boolean>>;
  setTransaction: Dispatch<SetStateAction<Transaction | null>>;
  setTxResult: Dispatch<SetStateAction<ITransactionOnNetwork | null>>;
  setError: Dispatch<SetStateAction<string>>;
  cb?: (params: TransactionCallbackParams) => void;
  ongoingTxId?: string;
}

export const useWebWalletTxSend = ({
  setPending,
  setTransaction,
  setTxResult,
  cb,
  setError,
  ongoingTxId,
}: UseWebWalletTxSendProps) => {
  const accountSnap = useAccount();
  const networkStateSnap = useNetwork();
  const loginInfoSnap = useLoginInfo();
  const configStateSnap = useConfig();
  const currentNonce = accountSnap.nonce;

  useEffect(() => {
    const walletProviderStatus = getParamFromUrl(
      WALLET_PROVIDER_CALLBACK_PARAM
    );
    const hasWebWalletGuardianSign = getParamFromUrl(
      WebWalletUrlParamsEnum.hasWebWalletGuardianSign
    );

    const ongoingTxUrl = getParamFromUrl('ongoingTx') || undefined;

    // Check if this is a transaction with defined id
    // Compare to differentiate it from other useTransaction triggers
    if (ongoingTxUrl !== ongoingTxId) return;

    const send = async () => {
      if (
        networkStateSnap.dappProvider &&
        networkStateSnap.apiNetworkProvider
      ) {
        let transactionObj: PlainSignedTransaction;
        if ('getTransactionsFromWalletUrl' in networkStateSnap.dappProvider) {
          const txs =
            networkStateSnap.dappProvider.getTransactionsFromWalletUrl();

          // For now it is prepared for handling one transaction at a time
          transactionObj = txs?.[0];
          if (!transactionObj) return;
          if (loginInfoSnap.loginMethod === LoginMethodsEnum.wallet) {
            transactionObj.data = Buffer.from(transactionObj.data).toString(
              'base64'
            );
          }
        } else if (
          accountSnap.activeGuardianAddress &&
          loginInfoSnap.loginMethod !== LoginMethodsEnum.wallet &&
          loginInfoSnap.loginMethod !== LoginMethodsEnum.xalias &&
          hasWebWalletGuardianSign
        ) {
          const webWalletProvider = new WalletProvider(
            `${configStateSnap.walletAddress}${DAPP_INIT_ROUTE}`
          );
          const txs = webWalletProvider.getTransactionsFromWalletUrl();
          transactionObj = txs?.[0];
        } else {
          return;
        }

        if (!transactionObj) return;

        setPending(true);
        cb?.({ pending: true });
        const transaction = Transaction.fromPlainObject(transactionObj);
        try {
          preSendTxOperations(transaction);
          await networkStateSnap.apiNetworkProvider.sendTransaction(
            transaction
          );
          setTransaction(transaction);
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
          setAccountState('nonce', currentNonce + 1);
          window.history.replaceState(null, '', window.location.pathname);
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
  }, [networkStateSnap.apiNetworkProvider, networkStateSnap.dappProvider]);
};

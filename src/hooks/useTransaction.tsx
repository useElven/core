/* eslint-disable react-hooks/exhaustive-deps */
import { useState } from 'react';
import {
  Address,
  Transaction,
  ITransactionPayload,
  IGasLimit,
  ITransactionValue,
  ITransactionOnNetwork,
} from '@multiversx/sdk-core';
import { useWebWalletTxSend } from './common-helpers/useWebWalletTxSend';
import {
  TransactionCallbackParams,
  signAndSendTxOperations,
} from './common-helpers/signAndSendTxOperations';
import { DappProvider } from '../types/network';
import { ApiNetworkProvider } from '@multiversx/sdk-network-providers';
import { useConfig } from './useConfig';
import { useLoginInfo } from './useLoginInfo';
import { useAccount } from './useAccount';
import { useNetwork } from './useNetwork';

export interface TransactionParams {
  address?: string;
  gasLimit?: IGasLimit;
  data?: ITransactionPayload;
  value?: ITransactionValue;
  tx?: Transaction; // When provided other params are not needed
}

export interface TransactionArgs {
  id?: string;
  webWalletRedirectUrl?: string;
  cb?: (params: TransactionCallbackParams) => void;
}

export function useTransaction(
  { id, webWalletRedirectUrl, cb }: TransactionArgs = {
    id: undefined,
    webWalletRedirectUrl: undefined,
    cb: undefined,
  }
) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');
  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [txResult, setTxResult] = useState<ITransactionOnNetwork | null>(null);
  const accountSnap = useAccount();
  const loginInfoSnap = useLoginInfo();
  const networkStateSnap = useNetwork();
  const configStateSnap = useConfig();

  const currentNonce = accountSnap.nonce;

  useWebWalletTxSend({
    setPending,
    setTransaction,
    setTxResult,
    setError,
    cb,
    ongoingTxId: id,
  });

  const triggerTx = async ({
    address,
    data,
    gasLimit,
    value,
    tx,
  }: TransactionParams) => {
    setTransaction(null);
    setTxResult(null);
    setError('');

    if (!tx && !gasLimit) {
      setError('You need to provide the gas limit in the triggerTx function!');
      return;
    }

    if (
      networkStateSnap.dappProvider &&
      networkStateSnap.apiNetworkProvider &&
      currentNonce !== undefined &&
      accountSnap.address
    ) {
      setPending(true);
      cb?.({ pending: true });

      const sender = new Address(accountSnap.address);
      const activeGuardianAddress = accountSnap.activeGuardianAddress;

      // You can pass whole Transaction object or you can create it
      const transaction =
        tx ||
        new Transaction({
          nonce: currentNonce,
          receiver: new Address(address),
          gasLimit:
            (gasLimit?.valueOf() || 0) +
            (accountSnap.activeGuardianAddress ? 50000 : 0),
          chainID: configStateSnap.shortId || 'D',
          data,
          value: value || 0,
          sender,
        });

      signAndSendTxOperations(
        networkStateSnap.dappProvider as DappProvider,
        transaction,
        loginInfoSnap,
        networkStateSnap.apiNetworkProvider as ApiNetworkProvider,
        setTransaction,
        setTxResult,
        setError,
        setPending,
        webWalletRedirectUrl,
        cb,
        activeGuardianAddress,
        configStateSnap.walletAddress,
        id
      );
    } else {
      setError(
        'There is something wrong with the network synchronization. Check if you are logged in.'
      );
    }
  };

  return {
    pending,
    triggerTx,
    transaction,
    txResult,
    error,
  };
}

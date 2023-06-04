/* eslint-disable react-hooks/exhaustive-deps */
import { useState } from 'react';
import {
  Address,
  Transaction,
  ITransactionPayload,
  IGasLimit,
  ITransactionValue,
  ITransactionOnNetwork,
  Account,
} from '@multiversx/sdk-core';
import { useWebWalletTxSend } from './common-helpers/useWebWalletTxSend';
import {
  TransactionCallbackParams,
  sendTxOperations,
} from './common-helpers/sendTxOperations';
import { DappProvider } from '../types/network';
import { setAccountState } from '../store/auth';
import { ApiNetworkProvider } from '@multiversx/sdk-network-providers/out';
import { useConfig } from './useConfig';
import { useLoginInfo } from './useLoginInfo';
import { useAccount } from './useAccount';
import { useNetwork } from './useNetwork';

interface TransactionParams {
  address: string;
  gasLimit: IGasLimit;
  data?: ITransactionPayload;
  value?: ITransactionValue;
}

export interface TransactionArgs {
  webWalletRedirectUrl?: string;
  cb?: (params: TransactionCallbackParams) => void;
}

export function useTransaction(
  { webWalletRedirectUrl, cb }: TransactionArgs = {
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

  useWebWalletTxSend({ setPending, setTransaction, setTxResult, setError, cb });

  const triggerTx = async ({
    address,
    data,
    gasLimit,
    value,
  }: TransactionParams) => {
    setTransaction(null);
    setTxResult(null);
    setError('');

    if (
      networkStateSnap.dappProvider &&
      networkStateSnap.apiNetworkProvider &&
      currentNonce !== undefined &&
      !pending &&
      accountSnap.address
    ) {
      setPending(true);
      cb?.({ pending: true });

      const sender = new Address(accountSnap.address);

      const tx = new Transaction({
        nonce: currentNonce,
        receiver: new Address(address),
        gasLimit,
        chainID: configStateSnap.shortId || 'D',
        data,
        value: value || 0,
        sender,
      });

      const senderAccount = new Account(sender);
      senderAccount.incrementNonce();
      setAccountState('nonce', currentNonce + 1);

      sendTxOperations(
        networkStateSnap.dappProvider as DappProvider,
        tx,
        loginInfoSnap,
        networkStateSnap.apiNetworkProvider as ApiNetworkProvider,
        setTransaction,
        setTxResult,
        setError,
        setPending,
        webWalletRedirectUrl,
        cb
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

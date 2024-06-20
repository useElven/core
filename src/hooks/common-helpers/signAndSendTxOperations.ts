// Tools used internally by sent transactions hooks
import { Dispatch, SetStateAction } from 'react';
import {
  Account,
  Address,
  TransactionWatcher,
  Transaction,
  ITransactionOnNetwork,
  TransactionOptions,
  TransactionVersion,
} from '@multiversx/sdk-core';
import { ExtensionProvider } from '@multiversx/sdk-extension-provider';
import { WalletConnectV2Provider } from '@multiversx/sdk-wallet-connect-provider';
import { HWProvider } from '@multiversx/sdk-hw-provider';
import { setAccountState, LoginInfoState } from '../../store/auth';
import { NetworkState } from '../../store/network';
import { ApiNetworkProvider } from '@multiversx/sdk-network-providers';
import { LoginMethodsEnum, WebWalletUrlParamsEnum } from '../../types/enums';
import { WalletProvider } from '@multiversx/sdk-web-wallet-provider';
import { DappProvider } from '../../types/network';
import { errorParse } from '../../utils/errorParse';
import { DAPP_INIT_ROUTE } from '../../config/network';
import { getCallbackUrl } from '../../utils/getCallbackUrl';
import { WebviewProvider } from '@multiversx/sdk-webview-provider';

export interface TransactionCallbackParams {
  transaction?: Transaction | null;
  error?: string;
  pending?: boolean;
  txResult?: ITransactionOnNetwork | null;
}

export const preSendTxOperations = (signedTx: Transaction) => {
  const sender = signedTx.getSender();
  const currentNonce = signedTx.getNonce().valueOf();
  const senderAccount = new Account(sender);
  senderAccount.incrementNonce();
  setAccountState('nonce', currentNonce + 1);
};

export const guardianPreSignTxOperations = (
  tx: Transaction,
  dappProvider: DappProvider,
  activeGuardianAddress?: string
) => {
  if (activeGuardianAddress) {
    const isLedger = dappProvider instanceof HWProvider;
    const options = {
      guarded: true,
      ...(isLedger ? { hashSign: true } : {}),
    };
    tx.setVersion(TransactionVersion.withTxOptions());
    tx.setOptions(TransactionOptions.withOptions(options));
    tx.setGuardian(Address.fromBech32(activeGuardianAddress));
  }

  return tx;
};

export const postSendTxOperations = async (
  signedTx: Transaction,
  setTransaction: Dispatch<SetStateAction<Transaction | null>>,
  setTxResult: Dispatch<SetStateAction<ITransactionOnNetwork | null>>,
  apiNetworkProvider: NetworkState['apiNetworkProvider'],
  cb?: (params: TransactionCallbackParams) => void,
  txWatcherTimeout?: string,
  txWatcherPatience?: string
) => {
  setTransaction(signedTx);
  if (apiNetworkProvider) {
    const transactionWatcher = new TransactionWatcher(apiNetworkProvider, {
      ...(txWatcherTimeout
        ? { timeoutMilliseconds: parseInt(txWatcherTimeout) }
        : {}),
      ...(txWatcherPatience
        ? { patienceMilliseconds: parseInt(txWatcherPatience) }
        : {}),
    });
    const txResult = await transactionWatcher.awaitCompleted(signedTx);
    setTransaction(signedTx);
    setTxResult(txResult);
    cb?.({ transaction: signedTx, pending: false, txResult });
    const sender = signedTx.getSender();
    const senderAccount = new Account(sender);
    const userAccountOnNetwork = await apiNetworkProvider.getAccount(sender);
    senderAccount.update(userAccountOnNetwork);
    setAccountState('address', senderAccount.address.bech32());
    setAccountState('balance', senderAccount.balance.toString());
  }
};

/**
 * Redirect to wallet for signing if:
 * - account is guarded &
 * - 2FA will not be provided locally &
 * - transactions were not signed by guardian
 */
export const checkNeedsGuardianSigning = (
  signedTx: Transaction,
  activeGuardianAddress?: string,
  walletAddress?: string
) => {
  if (!walletAddress || !activeGuardianAddress) {
    return false;
  }

  if (signedTx.isGuardedTransaction()) {
    return false;
  }

  return true;
};

const getClbckUrl = (ongoingTxId?: string, callbackUrl?: string) => {
  const clbck = getCallbackUrl(callbackUrl);

  if (!ongoingTxId) return clbck;

  const alteredCallbackUrl = new URL(clbck);
  alteredCallbackUrl.searchParams.set('ongoingTx', ongoingTxId);

  return alteredCallbackUrl.toString();
};

export const sendTxToGuardian = async (
  signedTx: Transaction,
  walletAddress?: string,
  callbackUrl?: string,
  ongoingTxId?: string
) => {
  const webWalletProvider = new WalletProvider(
    `${walletAddress}${DAPP_INIT_ROUTE}`
  );

  const clbck = getClbckUrl(ongoingTxId, callbackUrl);

  const alteredCallbackUrl = new URL(clbck);
  alteredCallbackUrl.searchParams.set(
    WebWalletUrlParamsEnum.hasWebWalletGuardianSign,
    'true'
  );

  await webWalletProvider.guardTransactions([signedTx], {
    callbackUrl: encodeURIComponent(alteredCallbackUrl.toString()),
  });
};

export const signAndSendTxOperations = async (
  dappProvider: DappProvider,
  tx: Transaction,
  loginInfoSnap: LoginInfoState,
  apiNetworkProvider: ApiNetworkProvider,
  setTransaction: Dispatch<SetStateAction<Transaction | null>>,
  setTxResult: Dispatch<SetStateAction<ITransactionOnNetwork | null>>,
  setError: Dispatch<SetStateAction<string>>,
  setPending: Dispatch<SetStateAction<boolean>>,
  callbackUrl?: string,
  cb?: (params: TransactionCallbackParams) => void,
  activeGuardianAddress?: string,
  walletAddress?: string,
  ongoingTxId?: string,
  txWatcherTimeout?: string,
  txWatcherPatience?: string
) => {
  let signedTx = guardianPreSignTxOperations(
    tx,
    dappProvider,
    activeGuardianAddress
  );

  try {
    if (dappProvider instanceof WalletProvider) {
      await dappProvider.signTransaction(tx, {
        callbackUrl: encodeURIComponent(getClbckUrl(ongoingTxId, callbackUrl)),
      });
    }
    if (dappProvider instanceof ExtensionProvider) {
      signedTx = await dappProvider.signTransaction(tx);
    }
    if (dappProvider instanceof WalletConnectV2Provider) {
      signedTx = await dappProvider.signTransaction(tx);
    }
    if (dappProvider instanceof WebviewProvider) {
      signedTx = (await dappProvider.signTransaction(tx)) as Transaction;
    }
    if (dappProvider instanceof HWProvider) {
      signedTx = await dappProvider.signTransaction(tx);
    }
    if (
      loginInfoSnap.loginMethod !== LoginMethodsEnum.wallet &&
      loginInfoSnap.loginMethod !== LoginMethodsEnum.xalias
    ) {
      const needsGuardianSign = checkNeedsGuardianSigning(
        signedTx,
        activeGuardianAddress,
        walletAddress
      );

      if (needsGuardianSign) {
        await sendTxToGuardian(
          signedTx,
          walletAddress,
          callbackUrl,
          ongoingTxId
        );

        return;
      }

      preSendTxOperations(signedTx);
      await apiNetworkProvider.sendTransaction(signedTx);
      await postSendTxOperations(
        signedTx,
        setTransaction,
        setTxResult,
        apiNetworkProvider,
        cb,
        txWatcherTimeout,
        txWatcherPatience
      );
    }
  } catch (e) {
    const err = errorParse(e);
    setError(err);
    cb?.({ error: err });
  } finally {
    setPending(false);
    cb?.({ pending: false });
  }
};

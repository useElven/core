import { useState } from 'react';
import {
  TokenTransfer,
  TypedValue,
  Address,
  SmartContractTransactionsFactory,
  TransactionsFactoryConfig,
  TransferTransactionsFactory,
} from '@multiversx/sdk-core';
import { useTransaction, TransactionArgs } from './useTransaction';
import { apiCall } from '../utils/apiCall';
import { ESDTType } from '../types/enums';
import { useAccount } from './useAccount';
import { useConfig } from './useConfig';

const NETWORK_ERROR_MSG =
  "Network error: Can't fetch the tokens data. Check whether the token identifiers are valid.";

export interface MultiTransferToken {
  type: ESDTType;
  tokenId: string;
  amount: string;
}

export type MultiTokenTransferTxArgs = {
  tokens: MultiTransferToken[];
  receiver: string;
  gasLimit?: never;
  endpointName?: never;
  endpointArgs?: never;
};

export type MultiTokenTransferScArgs<T> = {
  tokens: MultiTransferToken[];
  receiver: string;
  gasLimit: number;
  endpointName: string;
  endpointArgs?: T[];
};

export type MultiTokenTransferArgs<T> =
  | MultiTokenTransferTxArgs
  | MultiTokenTransferScArgs<T>;

export interface MultiTokenTransferHookProps {
  id?: TransactionArgs['id'];
  callbackUrl?: TransactionArgs['callbackUrl'];
  cb?: TransactionArgs['cb'];
}

export const useMultiTokenTransfer = (
  { id, callbackUrl, cb }: MultiTokenTransferHookProps = {
    id: undefined,
    callbackUrl: undefined,
    cb: undefined,
  }
) => {
  const [networkError, setNetworkError] = useState<string>();

  const { address } = useAccount();
  const { shortId } = useConfig();

  const { triggerTx, pending, transaction, txResult, error } = useTransaction({
    id,
    callbackUrl,
    cb,
  });

  const transfer = async function <T extends TypedValue>({
    tokens,
    receiver,
    gasLimit,
    endpointName,
    endpointArgs,
  }: MultiTokenTransferArgs<T>) {
    const transfers: TokenTransfer[] = [];

    for (const token of tokens) {
      if (token.type === ESDTType.FungibleESDT) {
        try {
          const result = await apiCall.get(`/tokens/${token.tokenId.trim()}`);
          transfers.push(
            // TODO: Legacy TokenTransfer usage, use constructor instead
            TokenTransfer.fungibleFromAmount(
              token.tokenId,
              token.amount,
              result.decimals
            )
          );
        } catch (e) {
          setNetworkError(NETWORK_ERROR_MSG);
          return;
        }
      }

      if (
        [
          ESDTType.NonFungibleESDT,
          ESDTType.MetaESDT,
          ESDTType.SemiFungibleESDT,
        ].includes(token.type)
      ) {
        try {
          const result = await apiCall.get(`/nfts/${token.tokenId.trim()}`);

          if (token.type === ESDTType.NonFungibleESDT) {
            transfers.push(
              // TODO: Legacy TokenTransfer usage, use constructor instead
              TokenTransfer.nonFungible(result.collection, result.nonce)
            );
          }
          if (token.type === ESDTType.SemiFungibleESDT) {
            transfers.push(
              // TODO: Legacy TokenTransfer usage, use constructor instead
              TokenTransfer.semiFungible(
                result.collection,
                result.nonce,
                parseInt(token.amount, 10)
              )
            );
          }
          if (token.type === ESDTType.MetaESDT) {
            transfers.push(
              // TODO: Legacy TokenTransfer usage, use constructor instead
              TokenTransfer.metaEsdtFromAmount(
                result.collection,
                result.nonce,
                parseFloat(token.amount),
                result.decimals
              )
            );
          }
        } catch (e) {
          setNetworkError(NETWORK_ERROR_MSG);
          return;
        }
      }
    }

    const factoryConfig = new TransactionsFactoryConfig({
      chainID: shortId || 'D',
    });

    const scTxFactory = new SmartContractTransactionsFactory({
      config: factoryConfig,
    });

    const txFactory = new TransferTransactionsFactory({
      config: factoryConfig,
    });

    let tx;

    if (endpointName) {
      tx = scTxFactory.createTransactionForExecute({
        sender: Address.fromBech32(address),
        contract: Address.fromBech32(receiver),
        gasLimit: BigInt(gasLimit!),
        tokenTransfers: transfers,
        function: endpointName,
        ...(endpointArgs ? { arguments: endpointArgs } : {}),
      });
    } else {
      tx = txFactory.createTransactionForESDTTokenTransfer({
        sender: Address.fromBech32(address),
        receiver: Address.fromBech32(receiver),
        tokenTransfers: transfers,
      });
    }

    triggerTx({ tx });
  };

  return {
    transfer,
    pending,
    transaction,
    txResult,
    error: networkError || error,
  };
};

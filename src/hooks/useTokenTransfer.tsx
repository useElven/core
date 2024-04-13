import { useState } from 'react';
import {
  TokenTransfer,
  TypedValue,
  Address,
  SmartContractTransactionsFactory,
  TransactionsFactoryConfig,
  TransferTransactionsFactory,
  Token,
} from '@multiversx/sdk-core';
import { useTransaction, TransactionArgs } from './useTransaction';
import { apiCall } from '../utils/apiCall';
import { ESDTType } from '../types/enums';
import { useAccount } from './useAccount';
import { useConfig } from './useConfig';
import { parseAmount } from '../utils/amount';

interface BaseToken {
  type: ESDTType;
  tokenId: string;
}

interface NonFungibleESDTToken extends BaseToken {
  type: ESDTType.NonFungibleESDT;
  amount?: never;
}

interface OtherToken extends BaseToken {
  type: ESDTType.FungibleESDT | ESDTType.SemiFungibleESDT | ESDTType.MetaESDT;
  amount: string;
}

type MultiTransferToken = NonFungibleESDTToken | OtherToken;

type MultiTokenTransferTxArgs = {
  tokens: MultiTransferToken[];
  receiver: string;
  gasLimit?: never;
  endpointName?: never;
  endpointArgs?: never;
};

type MultiTokenTransferScArgs<T> = {
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

export const useTokenTransfer = (
  { id, callbackUrl, cb }: MultiTokenTransferHookProps = {
    id: undefined,
    callbackUrl: undefined,
    cb: undefined,
  }
) => {
  const [networkError, setNetworkError] = useState<string>();

  const { address, nonce } = useAccount();
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
    try {
      for (const token of tokens) {
        if (token.type === ESDTType.FungibleESDT) {
          const result = await apiCall.get(`/tokens/${token.tokenId.trim()}`);
          transfers.push(
            new TokenTransfer({
              token: new Token({ identifier: token.tokenId.trim() }),
              amount: parseAmount({
                amount: token.amount,
                decimals: result.decimals,
              }),
            })
          );
        }

        if (
          [
            ESDTType.NonFungibleESDT,
            ESDTType.MetaESDT,
            ESDTType.SemiFungibleESDT,
          ].includes(token.type)
        ) {
          const result = await apiCall.get(`/nfts/${token.tokenId.trim()}`);

          if (token.type === ESDTType.NonFungibleESDT) {
            transfers.push(
              new TokenTransfer({
                token: new Token({
                  identifier: result.collection,
                  nonce: result.nonce,
                }),
                amount: 1n,
              })
            );
          }
          if (token.type === ESDTType.SemiFungibleESDT) {
            transfers.push(
              new TokenTransfer({
                token: new Token({
                  identifier: result.collection,
                  nonce: result.nonce,
                }),
                amount: BigInt(token.amount),
              })
            );
          }
          if (token.type === ESDTType.MetaESDT) {
            transfers.push(
              new TokenTransfer({
                token: new Token({
                  identifier: result.collection,
                  nonce: result.nonce,
                }),
                amount: parseAmount({
                  amount: token.amount,
                  decimals: result.decimals,
                }),
              })
            );
          }
        }
      }
    } catch (e) {
      setNetworkError(`Something went wrong: ${e}`);
      return;
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

    tx.nonce = BigInt(nonce);

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

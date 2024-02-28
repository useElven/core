import { useState } from 'react';
import {
  TokenTransfer,
  GasEstimator,
  ContractCallPayloadBuilder,
  ContractFunction,
  BytesValue,
  BigUIntValue,
  TypedValue,
  U64Value,
  AddressValue,
  Address,
} from '@multiversx/sdk-core';
import { useTransaction, TransactionArgs } from './useTransaction';
import { apiCall } from '../utils/apiCall';
import { ESDTType } from '../types/enums';
import { useAccount } from './useAccount';

const NETWORK_ERROR_MSG =
  "Network error: Can't fetch the tokens data. Check whether the token identifiers are valid.";

export interface MultiTransferToken {
  type: ESDTType;
  tokenId: string;
  amount: string;
}

export interface MultiTokenTransferArgs<T> {
  tokens: MultiTransferToken[];
  receiver: string;
  gasLimit?: number;
  endpointName?: string;
  endpointArgs?: T[];
}

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
              TokenTransfer.nonFungible(result.collection, result.nonce)
            );
          }
          if (token.type === ESDTType.SemiFungibleESDT) {
            transfers.push(
              TokenTransfer.semiFungible(
                result.collection,
                result.nonce,
                parseInt(token.amount, 10)
              )
            );
          }
          if (token.type === ESDTType.MetaESDT) {
            transfers.push(
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

    const data = new ContractCallPayloadBuilder()
      .setFunction(new ContractFunction('MultiESDTNFTTransfer'))
      .setArgs([
        new AddressValue(new Address(receiver)),
        new U64Value(transfers.length || 0),
        ...transfers.flatMap((transfer) => [
          BytesValue.fromUTF8(transfer.tokenIdentifier),
          new U64Value(transfer.nonce || 0),
          new BigUIntValue(transfer.amountAsBigInteger),
        ]),
        ...(endpointName ? [BytesValue.fromUTF8(endpointName)] : []),
        ...(endpointArgs || []),
      ])
      .build();

    const gasEstimator = new GasEstimator();

    triggerTx({
      address,
      gasLimit:
        gasLimit ||
        gasEstimator.forMultiESDTNFTTransfer(data.length(), transfers.length),
      data,
    });
  };

  return {
    transfer,
    pending,
    transaction,
    txResult,
    error: networkError || error,
  };
};

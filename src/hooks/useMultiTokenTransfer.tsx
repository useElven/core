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
import { useAccount } from './useAccount';

export enum MultiTransferTokenType {
  FungibleESDT = 'FungibleESDT',
  MetaESDT = 'MetaESDT',
  NonFungibleESDT = 'NonFungibleESDT',
  SemiFungibleESDT = 'SemiFungibleESDT',
}

export interface MultiTransferToken {
  type: MultiTransferTokenType;
  tokenId: string;
  amount: string;
}

export interface MultiTokenTransferArgs {
  tokens: MultiTransferToken[];
  receiver: string;
  gasLimit?: number;
  endpointName?: string;
  endpointArgs?: TypedValue[];
  value?: number;
}

export interface MultiTokenTransferHookProps {
  id?: TransactionArgs['id'];
  webWalletRedirectUrl?: TransactionArgs['webWalletRedirectUrl'];
  cb?: TransactionArgs['cb'];
}

export const useMultiTokenTransfer = (
  { id, webWalletRedirectUrl, cb }: MultiTokenTransferHookProps = {
    id: undefined,
    webWalletRedirectUrl: undefined,
    cb: undefined,
  }
) => {
  const { address } = useAccount();

  const { triggerTx, pending, transaction, txResult, error } = useTransaction({
    id,
    webWalletRedirectUrl,
    cb,
  });

  const transfer = async ({
    tokens,
    receiver,
    gasLimit,
    endpointName,
    endpointArgs,
    value = 0,
  }: MultiTokenTransferArgs) => {
    const transfers: TokenTransfer[] = [];

    for (const token of tokens) {
      let result;
      if (token.type === MultiTransferTokenType.FungibleESDT) {
        try {
          result = await apiCall.get(`/tokens/${token.tokenId.trim()}`);
          transfers.push(
            TokenTransfer.fungibleFromAmount(
              token.tokenId,
              token.amount,
              result.decimals
            )
          );
        } catch (e) {
          console.log((e as Error)?.message);
        }
      }

      if (
        [
          MultiTransferTokenType.NonFungibleESDT,
          MultiTransferTokenType.MetaESDT,
          MultiTransferTokenType.SemiFungibleESDT,
        ].includes(token.type)
      ) {
        try {
          result = await apiCall.get(`/nfts/${token.tokenId.trim()}`);
        } catch (e) {
          console.log((e as Error)?.message);
        }
      }

      if (token.type === MultiTransferTokenType.NonFungibleESDT) {
        transfers.push(
          TokenTransfer.nonFungible(result.collection, result.nonce)
        );
      }
      if (token.type === MultiTransferTokenType.SemiFungibleESDT) {
        transfers.push(
          TokenTransfer.semiFungible(
            result.collection,
            result.nonce,
            parseInt(token.amount, 10)
          )
        );
      }
      if (token.type === MultiTransferTokenType.MetaESDT) {
        transfers.push(
          TokenTransfer.metaEsdtFromAmount(
            result.collection,
            result.nonce,
            parseFloat(token.amount),
            result.decimals
          )
        );
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
      value,
      data,
    });
  };

  return {
    transfer,
    pending,
    transaction,
    txResult,
    error,
  };
};

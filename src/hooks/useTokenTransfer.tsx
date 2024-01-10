import { useState } from 'react';
import {
  ContractCallPayloadBuilder,
  ContractFunction,
  BytesValue,
  U64Value,
  BigUIntValue,
  Address,
  AddressValue,
  TypedValue,
  GasEstimator,
  TokenTransfer,
} from '@multiversx/sdk-core';
import { useTransaction, TransactionArgs } from './useTransaction';
import { ESDTType } from '../types/enums';
import { useAccount } from './useAccount';
import { apiCall } from '../utils/apiCall';

const NETWORK_ERROR_MSG =
  "Network error: Can't fetch the token data. Check whether the token identifier is valid.";

export interface ScTokenTransferHookProps {
  id: TransactionArgs['id'];
  webWalletRedirectUrl?: TransactionArgs['webWalletRedirectUrl'];
  cb?: TransactionArgs['cb'];
}

export interface ScTokenTransferArgs {
  type: ESDTType;
  tokenId: string;
  gasLimit?: number;
  receiver: string;
  amount?: string;
  endpointName?: string;
  endpointArgs?: TypedValue[];
}

export const useTokenTransfer = (
  { id, webWalletRedirectUrl, cb }: ScTokenTransferHookProps = {
    id: undefined,
    webWalletRedirectUrl: undefined,
    cb: undefined,
  }
) => {
  const [networkError, setNetworkError] = useState<string>();

  const { address: accountAddress } = useAccount();

  const { triggerTx, pending, transaction, txResult, error } = useTransaction({
    id,
    webWalletRedirectUrl,
    cb,
  });

  const transfer = async ({
    type,
    tokenId,
    gasLimit,
    receiver,
    amount,
    endpointName,
    endpointArgs,
  }: ScTokenTransferArgs) => {
    if (type === ESDTType.FungibleESDT && amount === undefined) {
      throw new Error('Amount to send is required in ESDTTransfer type!');
    }

    let transfer;

    if (type === ESDTType.FungibleESDT && amount !== undefined) {
      try {
        const result = await apiCall.get(`/tokens/${tokenId.trim()}`);
        transfer = TokenTransfer.fungibleFromAmount(
          tokenId,
          amount,
          result.decimals
        );
      } catch (e) {
        setNetworkError(NETWORK_ERROR_MSG);
        return;
      }
    }

    if (type !== ESDTType.FungibleESDT && tokenId) {
      try {
        const result = await apiCall.get(`/nfts/${tokenId.trim()}`);

        if (type === ESDTType.NonFungibleESDT) {
          transfer = TokenTransfer.nonFungible(result.collection, result.nonce);
        }

        if (type === ESDTType.SemiFungibleESDT && amount !== undefined) {
          transfer = TokenTransfer.semiFungible(
            result.collection,
            result.nonce,
            parseInt(amount, 10)
          );
        }

        if (type === ESDTType.MetaESDT && amount !== undefined) {
          transfer = TokenTransfer.metaEsdtFromAmount(
            result.collection,
            result.nonce,
            parseFloat(amount),
            result.decimals
          );
        }
      } catch (e) {
        setNetworkError(NETWORK_ERROR_MSG);
        return;
      }
    }

    if (!transfer) {
      throw new Error("The transfer can't be processed!");
    }

    if (type === ESDTType.FungibleESDT) {
      const data = new ContractCallPayloadBuilder()
        .setFunction(new ContractFunction('ESDTTransfer'))
        .setArgs([
          BytesValue.fromUTF8(transfer.tokenIdentifier),
          new BigUIntValue(transfer.amountAsBigInteger),
          new AddressValue(new Address(receiver)),
          ...(endpointName ? [BytesValue.fromUTF8(endpointName)] : []),
          ...(endpointArgs || []),
        ])
        .build();

      const gasEstimator = new GasEstimator();

      triggerTx({
        address: receiver,
        gasLimit: gasLimit || gasEstimator.forESDTTransfer(data.length()),
        data,
      });
    } else {
      const data = new ContractCallPayloadBuilder()
        .setFunction(new ContractFunction('ESDTNFTTransfer'))
        .setArgs([
          BytesValue.fromUTF8(transfer.tokenIdentifier),
          new U64Value(transfer.nonce || 0),
          new BigUIntValue(
            type !== ESDTType.NonFungibleESDT ? transfer.amountAsBigInteger : 1
          ),
          new AddressValue(new Address(receiver)),
          ...(endpointName ? [BytesValue.fromUTF8(endpointName)] : []),
          ...(endpointArgs || []),
        ])
        .build();

      const gasEstimator = new GasEstimator();

      triggerTx({
        address: accountAddress,
        gasLimit: gasLimit || gasEstimator.forESDTNFTTransfer(data.length()),
        data,
      });
    }
  };

  return {
    transfer,
    pending,
    transaction,
    txResult,
    error: networkError || error,
  };
};

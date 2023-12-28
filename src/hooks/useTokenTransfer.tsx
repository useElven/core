import {
  ContractCallPayloadBuilder,
  ContractFunction,
  BytesValue,
  U64Value,
  BigUIntValue,
  Address,
  AddressValue,
  TypedValue,
} from '@multiversx/sdk-core';
import { useTransaction, TransactionArgs } from './useTransaction';
import { useAccount } from './useAccount';

export enum ScTokenTransferType {
  ESDTTransfer = 'ESDTTransfer',
  ESDTNFTTransfer = 'ESDTNFTTransfer',
}

export interface ScTokenTransferHookProps {
  id: TransactionArgs['id'];
  webWalletRedirectUrl?: TransactionArgs['webWalletRedirectUrl'];
  cb?: TransactionArgs['cb'];
}

export interface ScTokenTransferArgs {
  type: ScTokenTransferType;
  tokenId: string;
  gasLimit: number;
  address: string;
  nonce?: number;
  amount?: string;
  value?: number;
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
  const { address: accountAddress } = useAccount();
  const { triggerTx, pending, transaction, txResult, error } = useTransaction({
    id,
    webWalletRedirectUrl,
    cb,
  });

  const transfer = ({
    type,
    tokenId,
    nonce,
    gasLimit,
    address,
    amount,
    value = 0,
    endpointName,
    endpointArgs,
  }: ScTokenTransferArgs) => {
    if (type === ScTokenTransferType.ESDTTransfer && amount === undefined) {
      throw new Error('Amount to send is required in ESDTTransfer type!');
    }

    if (type === ScTokenTransferType.ESDTTransfer && amount !== undefined) {
      const data = new ContractCallPayloadBuilder()
        .setFunction(new ContractFunction(ScTokenTransferType.ESDTTransfer))
        .setArgs([
          BytesValue.fromUTF8(tokenId),
          new BigUIntValue(amount),
          ...(endpointName ? [BytesValue.fromUTF8(endpointName)] : []),
          ...(endpointArgs || []),
        ])
        .build();

      triggerTx({
        address,
        gasLimit,
        value,
        data,
      });
    }

    if (type === ScTokenTransferType.ESDTNFTTransfer && nonce === undefined) {
      throw new Error('Nonce is required in ESDTNFTTransfer type!');
    }

    if (type === ScTokenTransferType.ESDTNFTTransfer && nonce !== undefined) {
      const data = new ContractCallPayloadBuilder()
        .setFunction(new ContractFunction(ScTokenTransferType.ESDTNFTTransfer))
        .setArgs([
          BytesValue.fromUTF8(tokenId),
          new U64Value(nonce),
          new BigUIntValue(amount || 1),
          new AddressValue(new Address(address)),
          ...(endpointName ? [BytesValue.fromUTF8(endpointName)] : []),
          ...(endpointArgs || []),
        ])
        .build();

      triggerTx({
        address: accountAddress,
        gasLimit,
        value,
        data,
      });
    }
  };

  return {
    transfer,
    pending,
    transaction,
    txResult,
    error,
  };
};

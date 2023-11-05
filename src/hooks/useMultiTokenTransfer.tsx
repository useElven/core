import {
  Address,
  TokenTransfer,
  TransferTransactionsFactory,
  GasEstimator,
} from '@multiversx/sdk-core';
import { useTransaction, TransactionArgs } from './useTransaction';
import { useAccount } from './useAccount';
import { apiCall } from 'src/utils/apiCall';
import { useConfig } from './useConfig';

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
}

export interface MultiTokenTransferHookProps {
  webWalletRedirectUrl?: TransactionArgs['webWalletRedirectUrl'];
  cb?: TransactionArgs['cb'];
}

export const useMultiTokenTransfer = (
  { webWalletRedirectUrl, cb }: MultiTokenTransferHookProps = {
    webWalletRedirectUrl: undefined,
    cb: undefined,
  }
) => {
  const { address: accountAddress } = useAccount();
  const { shortId } = useConfig();
  const { nonce } = useAccount();
  const { triggerTx, pending, transaction, txResult, error } = useTransaction({
    webWalletRedirectUrl,
    cb,
  });

  const transfer = async ({ tokens, receiver }: MultiTokenTransferArgs) => {
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
        transfers.push(TokenTransfer.nonFungible(result.ticker, result.nonce));
      }
      if (token.type === MultiTransferTokenType.SemiFungibleESDT) {
        transfers.push(
          TokenTransfer.semiFungible(
            result.ticker,
            result.nonce,
            parseInt(token.amount, 10)
          )
        );
      }
      if (token.type === MultiTransferTokenType.MetaESDT) {
        transfers.push(
          TokenTransfer.metaEsdtFromAmount(
            result.ticker,
            result.nonce,
            parseFloat(token.amount),
            result.decimals
          )
        );
      }
    }

    const factory = new TransferTransactionsFactory(new GasEstimator());

    const tx = factory.createMultiESDTNFTTransfer({
      tokenTransfers: transfers,
      nonce,
      sender: new Address(accountAddress),
      destination: new Address(receiver),
      chainID: shortId || 'D',
    });

    triggerTx({ tx });
  };

  return {
    transfer,
    pending,
    transaction,
    txResult,
    error,
  };
};

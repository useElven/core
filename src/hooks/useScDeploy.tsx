import {
  Address,
  Code,
  SmartContract,
  CodeMetadata,
  TypedValue,
} from '@multiversx/sdk-core';
import { useTransaction, TransactionArgs } from './useTransaction';
import { useAccount } from './useAccount';
import { useConfig } from './useConfig';
import { errorParse } from '../utils/errorParse';

export interface ScDeployHookProps {
  id?: TransactionArgs['id'];
  webWalletRedirectUrl?: TransactionArgs['webWalletRedirectUrl'];
  cb?: TransactionArgs['cb'];
}

export interface ScDeployArgs {
  source: Buffer | string;
  gasLimit?: number;
  codeMetadata?: [boolean, boolean, boolean, boolean];
  initArguments?: TypedValue[];
}

export const useScDeploy = (
  { id, webWalletRedirectUrl, cb }: ScDeployHookProps = {
    id: undefined,
    webWalletRedirectUrl: undefined,
    cb: undefined,
  }
) => {
  const { address: accountAddress, nonce } = useAccount();
  const { shortId } = useConfig();

  const { triggerTx, pending, transaction, txResult, error } = useTransaction({
    id,
    webWalletRedirectUrl,
    cb,
  });

  const deploy = async ({
    source,
    gasLimit = 10_000_000,
    codeMetadata = [true, false, false, false],
    initArguments = [],
  }: ScDeployArgs) => {
    try {
      let code: Code;

      if (Buffer.isBuffer(source)) {
        code = Code.fromBuffer(source);
      } else {
        const response = await fetch(source);
        const bytes = await response.arrayBuffer();
        code = Code.fromBuffer(Buffer.from(bytes));
      }

      const smartContract = new SmartContract();
      const tx = smartContract.deploy({
        deployer: new Address(accountAddress),
        code,
        codeMetadata: new CodeMetadata(...codeMetadata),
        initArguments,
        gasLimit,
        chainID: shortId || 'D',
      });

      tx.setNonce(nonce);

      triggerTx({ tx });
    } catch (e) {
      throw new Error(errorParse(e));
    }
  };

  const scAddress = txResult?.logs.events
    ?.find((event) => event.identifier === 'SCDeploy')
    ?.address?.bech32();

  return {
    deploy,
    pending,
    transaction,
    txResult,
    scAddress,
    error,
  };
};

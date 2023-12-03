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
import { useState } from 'react';

export interface ScDeployHookProps {
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
  { webWalletRedirectUrl, cb }: ScDeployHookProps = {
    webWalletRedirectUrl: undefined,
    cb: undefined,
  }
) => {
  const [scAddress, setScAddress] = useState<string>();
  const { address: accountAddress, nonce } = useAccount();
  const { shortId } = useConfig();

  const { triggerTx, pending, transaction, txResult, error } = useTransaction({
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

      setScAddress(
        SmartContract.computeAddress(
          new Address(accountAddress),
          nonce
        ).bech32()
      );

      tx.setNonce(nonce);

      triggerTx({ tx });
    } catch (e) {
      throw new Error(errorParse(e));
    }
  };

  return {
    deploy,
    pending,
    transaction,
    txResult,
    scAddress,
    error,
  };
};

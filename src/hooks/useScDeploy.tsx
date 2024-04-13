import {
  Address,
  TypedValue,
  SmartContractTransactionsFactory,
  TransactionsFactoryConfig,
  Code,
} from '@multiversx/sdk-core';
import { useTransaction, TransactionArgs } from './useTransaction';
import { useAccount } from './useAccount';
import { useConfig } from './useConfig';
import { errorParse } from '../utils/errorParse';

export interface ScDeployHookProps {
  id?: TransactionArgs['id'];
  callbackUrl?: TransactionArgs['callbackUrl'];
  cb?: TransactionArgs['cb'];
}

export interface ScDeployArgs<T> {
  source: Buffer | string;
  gasLimit?: number;
  isUpgradeable?: boolean;
  isReadable?: boolean;
  isPayable?: boolean;
  isPayableBySmartContract?: boolean;
  initArguments?: T[];
}

export const useScDeploy = (
  { id, callbackUrl, cb }: ScDeployHookProps = {
    id: undefined,
    callbackUrl: undefined,
    cb: undefined,
  }
) => {
  const { address: accountAddress, nonce } = useAccount();
  const { shortId } = useConfig();

  const { triggerTx, pending, transaction, txResult, error } = useTransaction({
    id,
    callbackUrl,
    cb,
  });

  const deploy = async function <T extends TypedValue>({
    source,
    gasLimit = 10_000_000,
    initArguments = [],
    isUpgradeable = true,
    isReadable = false,
    isPayable = false,
    isPayableBySmartContract = false,
  }: ScDeployArgs<T>) {
    try {
      let code: Uint8Array;

      if (Buffer.isBuffer(source)) {
        code = Code.fromBuffer(source).valueOf();
      } else {
        const response = await fetch(source);
        const bytes = await response.arrayBuffer();
        code = Code.fromBuffer(Buffer.from(bytes)).valueOf();
      }

      const factoryConfig = new TransactionsFactoryConfig({
        chainID: shortId || 'D',
      });

      const factory = new SmartContractTransactionsFactory({
        config: factoryConfig,
      });

      const tx = factory.createTransactionForDeploy({
        sender: new Address(accountAddress),
        bytecode: code,
        isUpgradeable,
        isReadable,
        isPayable,
        isPayableBySmartContract,
        arguments: initArguments,
        gasLimit: BigInt(gasLimit),
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

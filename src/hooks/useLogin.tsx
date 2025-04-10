import { useWebWalletLogin } from './useWebWalletLogin';
import { useExtensionLogin } from './useExtensionLogin';
import { useMobileAppLogin } from './useMobileAppLogin';
import { useLedgerLogin } from './useLedgerLogin';
import { Login } from '../types/account';
import { LoginMethodsEnum } from '../types/enums';
import { useLoggingIn } from './useLoggingIn';
import { setLoggingInState } from '../store/auth';
import { useXaliasLogin } from './useXaliasLogin';

export const useLogin = (params?: Login) => {
  const loggingInStates = useLoggingIn();

  const { login: webLogin } = useWebWalletLogin(params);
  const { login: xAliasLogin } = useXaliasLogin(params);

  const {
    login: mobileLogin,
    walletConnectUri,
    walletConnectPairingLogin,
    walletConnectPairings,
    walletConnectRemovePairing,
  } = useMobileAppLogin(params);

  const { login: extensionLogin } = useExtensionLogin(params);

  const { login: ledgerLogin, getHWAccounts } = useLedgerLogin(params);

  const login = async (
    type: LoginMethodsEnum,
    ledgerAccountIndex?: number,
    ledgerPage?: number,
    ledgerPageSize?: number
  ) => {
    if (type === LoginMethodsEnum.extension) {
      await extensionLogin();
    }
    if (type === LoginMethodsEnum.wallet) {
      await webLogin();
    }
    if (type === LoginMethodsEnum.xalias) {
      await xAliasLogin();
    }
    if (type === LoginMethodsEnum.walletconnect) {
      await mobileLogin();
    }
    if (type === LoginMethodsEnum.ledger) {
      await ledgerLogin(ledgerAccountIndex, ledgerPage, ledgerPageSize);
    }
    return null;
  };

  return {
    walletConnectUri,
    walletConnectPairingLogin,
    walletConnectPairings,
    walletConnectRemovePairing,
    getHWAccounts,
    login,
    isLoggedIn: loggingInStates.loggedIn,
    isLoggingIn: loggingInStates.pending,
    error: loggingInStates.error,
    setLoggingInState,
  };
};

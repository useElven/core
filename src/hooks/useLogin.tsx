import { useWebWalletLogin } from './useWebWalletLogin';
import { useExtensionLogin } from './useExtensionLogin';
import { useMobileAppLogin } from './useMobileAppLogin';
import { useLedgerLogin } from './useLedgerLogin';
import { Login } from '../types/account';
import { LoginMethodsEnum } from '../types/enums';

export const useLogin = (params?: Login) => {
  const {
    login: webLogin,
    loggedIn: webIsLoggedIn,
    pending: webIsLoggingIn,
    error: webLoginError,
  } = useWebWalletLogin(params);

  const {
    login: mobileLogin,
    loggedIn: mobileIsLoggedIn,
    pending: mobileIsLoggingIn,
    walletConnectUri,
    walletConnectPairingLogin,
    walletConnectPairings,
    walletConnectRemovePairing,
    error: mobileLoginError,
  } = useMobileAppLogin(params);

  const {
    login: extensionLogin,
    loggedIn: extensionIsLoggedIn,
    pending: extensionIsLoggingIn,
    error: extensionLoginError,
  } = useExtensionLogin(params);

  const {
    login: ledgerLogin,
    loggedIn: ledgerIsLoggedIn,
    pending: ledgerIsLoggingIn,
    error: ledgerLoginError,
    getHWAccounts,
  } = useLedgerLogin(params);

  const login = async (type: LoginMethodsEnum, ledgerAccountIndex?: number) => {
    if (type === LoginMethodsEnum.extension) {
      await extensionLogin();
    }
    if (type === LoginMethodsEnum.wallet) {
      await webLogin();
    }
    if (type === LoginMethodsEnum.walletconnect) {
      await mobileLogin();
    }
    if (type === LoginMethodsEnum.ledger) {
      await ledgerLogin(ledgerAccountIndex);
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
    isLoggedIn:
      webIsLoggedIn ||
      mobileIsLoggedIn ||
      extensionIsLoggedIn ||
      ledgerIsLoggedIn,
    isLoggingIn:
      webIsLoggingIn ||
      mobileIsLoggingIn ||
      extensionIsLoggingIn ||
      ledgerIsLoggingIn,
    error:
      webLoginError ||
      mobileLoginError ||
      extensionLoginError ||
      ledgerLoginError,
  };
};

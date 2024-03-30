export const getCallbackUrl = (callbackUrl?: string) => {
  const currentUrl = window?.location?.href;
  const clbck =
    callbackUrl && window
      ? `${window.location.origin}${callbackUrl}`
      : currentUrl;
  return clbck;
};

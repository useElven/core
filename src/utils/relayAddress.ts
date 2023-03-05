export function getRelayAddressFromNetwork(
  walletConnectV2RelayAddresses: string[]
) {
  if (!walletConnectV2RelayAddresses.length) return null;
  return walletConnectV2RelayAddresses[
    Math.floor(Math.random() * walletConnectV2RelayAddresses.length)
  ];
}

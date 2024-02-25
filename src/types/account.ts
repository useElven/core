export interface LocalAccountInstance {
  address: string;
  balance: string;
  nonce: number;
}

export interface Login {
  callbackUrl?: string;
}

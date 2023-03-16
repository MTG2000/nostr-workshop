import { EventTemplate, Event } from "nostr-tools";

declare global {
  interface Window {
    nostr: Nostr;
  }
}

type Nostr = {
  getPublicKey(): Promise<string>;
  signEvent(event: EventTemplate): Promise<Event>;
  nip04?: {
    encrypt(pubkey: string, plaintext: string): Promise<string>; // returns ciphertext and iv as specified in nip-04
    decrypt(pubkey: string, ciphertext: string): Promise<string>; // takes ciphertext and iv as specified in nip-04
  };
};

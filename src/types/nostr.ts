export interface Metadata {
  name?: string;
  about?: string;
  picture?: string;
  nip05?: string;
  lud06?: string;
}

export type NostrProfile = {
  pubkey: string;
  name: string;
  image: string;
  about: string | null;
  link: string;
  nip05?: string | null;
  lightning_address?: string | null;
  boltfun_id?: number;
};

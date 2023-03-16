const DEFAULT_RELAYS = [
  "wss://nostr-pub.wellorder.net",
  "wss://nostr.drss.io",
  "wss://nostr.swiss-enigma.ch",
  "wss://relay.damus.io",
];

export class Relays {
  static relays = DEFAULT_RELAYS;

  static getRelays() {
    return this.relays;
  }

  static addRelay(relay: string) {
    this.relays.push(relay);
  }

  static removeRelay(relay: string) {
    this.relays = this.relays.filter((r) => r !== relay);
  }

  static setRelays(relays: string[]) {
    this.relays = relays;
  }
}

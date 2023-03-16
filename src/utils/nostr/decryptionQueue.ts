export class DecryptionQueue {
  static queue: [
    encryptedMsg: string,
    pubkey: string,
    cb: (error: unknown, decryptedMsg?: string) => void
  ][] = [];
  static isDecrypting = false;

  static add(
    encryptedMsg: string,
    pubkey: string,
    cb: (error: unknown, decryptedMsg?: string) => void
  ) {
    this.queue.push([encryptedMsg, pubkey, cb]);
    if (!this.isDecrypting) {
      this.decrypt();
    }
  }

  static async decrypt() {
    if (this.queue.length > 0) {
      this.isDecrypting = true;
      const [encryptedMsg, pubkey, cb] = this.queue.shift()!;
      try {
        const decryptedEvent = await window.nostr.nip04?.decrypt(
          pubkey,
          encryptedMsg
        );
        cb(null, decryptedEvent);
        this.isDecrypting = false;
        this.decrypt();
      } catch (error) {
        cb(error);
      }
    }
  }

  static clear() {
    this.queue = [];
  }
}

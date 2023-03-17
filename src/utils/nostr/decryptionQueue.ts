export class DecryptionQueue {
  static queue: [
    encryptedMsg: string,
    pubkey: string,
    cb: (error: unknown, decryptedMsg?: string) => void
  ][] = [];

  static decryptFn: (msg: string, theirPublicKey: string) => Promise<string>;

  static setDecryptFn(
    fn: (msg: string, theirPublicKey: string) => Promise<string>
  ) {
    this.decryptFn = fn;
  }

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
    if (!this.decryptFn) throw new Error("No decrypt function set");

    if (this.queue.length > 0) {
      this.isDecrypting = true;
      const [encryptedMsg, pubkey, cb] = this.queue.shift()!;
      try {
        const decryptedEvent = await this.decryptFn(encryptedMsg, pubkey);
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

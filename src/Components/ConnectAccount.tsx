import React from "react";
import { utils as secpUtils } from "@noble/secp256k1";
import { generatePrivateKey, getPublicKey, nip19 } from "nostr-tools";

interface Props {
  onConnected: (connection: NostrAccountConnection) => void;
}

export default function ConnectAccount({ onConnected }: Props) {
  const clickConnect = async (
    type: "nostr-ext" | "generated-keys" | "inputted-keys"
  ) => {
    let connectionObject: NostrAccountConnection;
    try {
      if (type === "nostr-ext")
        connectionObject = await connectToNostrExtension();
      else if (type === "generated-keys")
        connectionObject = await connectGeneratedKeys();
      else if (type === "inputted-keys")
        connectionObject = await connectInputtedKey();
      else throw new Error("Invalid tab");

      sessionStorage.setItem(
        "nostr-connection",
        JSON.stringify(connectionObject)
      );
      onConnected(connectionObject);
    } catch (error) {
      console.log(error);
      alert("Something wrong happened");
    }
  };

  return (
    <div className="bg-gray-700 p-24 rounded">
      <h1 className="text-h1">Connect Your Nostr Account</h1>
      <p>Choose a method from below: </p>

      <div className="flex flex-col gap-24 mt-24">
        <button
          onClick={() => clickConnect("nostr-ext")}
          className="bg-violet-500 text-body3 px-16 py-4 rounded-8 font-bold hover:bg-violet-600 active:scale-90"
        >
          Use Extension
        </button>

        <button
          onClick={() => clickConnect("generated-keys")}
          className="bg-violet-500 text-body3 px-16 py-4 rounded-8 font-bold hover:bg-violet-600 active:scale-90"
        >
          Generate New Key
        </button>

        <button
          onClick={() => clickConnect("inputted-keys")}
          className="bg-violet-500 text-body3 px-16 py-4 rounded-8 font-bold hover:bg-violet-600 active:scale-90"
        >
          Input Your Private Key
        </button>
      </div>
    </div>
  );
}

export type NostrAccountConnection =
  | {
      type: "nostr-ext";
      pubkey: string;
    }
  | {
      type: "generated-keys";
      prvkey: string;
      pubkey: string;
    }
  | {
      type: "inputted-keys";
      pubkey: string;
      prvkey: string;
    };

async function connectToNostrExtension() {
  if (window.nostr) {
    try {
      const pubkey = await window.nostr.getPublicKey();
      return {
        type: "nostr-ext",
        pubkey,
      } as NostrAccountConnection;
    } catch (err) {
      throw new Error("Permission to get public key rejected");
    }
  } else {
    throw new Error(
      "Couldn't find a nostr supporting extension in your browser"
    );
  }
}

function connectInputtedKey() {
  const prvkeyInput = window.prompt("Enter your private key");

  if (!isValidPrivateKey(prvkeyInput))
    throw new Error("You need to provide a valid private key");

  const prvkeyHex = prvkeyInput.startsWith("nsec")
    ? (nip19.decode(prvkeyInput).data as string)
    : prvkeyInput;

  const pubkey = getPublicKey(prvkeyHex);
  return {
    type: "inputted-keys",
    pubkey,
    prvkey: prvkeyHex,
  } as NostrAccountConnection;
}

function connectGeneratedKeys() {
  const prvkey = generatePrivateKey();
  if (!prvkey) throw new Error("Private key not provided");

  const pubkey = getPublicKey(prvkey);
  return {
    type: "generated-keys",
    prvkey,
    pubkey,
  } as NostrAccountConnection;
}

function isValidPrivateKey(
  prvKey: string | null | undefined
): prvKey is string {
  if (!prvKey) return false;
  const isValidHexKey = secpUtils.isValidPrivateKey(prvKey);
  const isValidBech32Key =
    prvKey.startsWith("nsec") &&
    secpUtils.isValidPrivateKey(nip19.decode(prvKey).data as string);

  // if (isValidBech32Key) console.log(getPublicKey(prvKey));

  return isValidHexKey || isValidBech32Key;
}

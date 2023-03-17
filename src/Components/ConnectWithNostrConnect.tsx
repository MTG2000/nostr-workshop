import { Connect, ConnectURI } from "@nostr-connect/connect";
import { generatePrivateKey, getPublicKey } from "nostr-tools";
import { useEffect } from "react";
import CopyToClipboard from "react-copy-to-clipboard";
import QRCode from "react-qr-code";

const nip46Relay = "wss://nostr-pub.wellorder.net";

const nip46SecretKey = generatePrivateKey();
const publicKey = getPublicKey(nip46SecretKey);

export default function ConnectWithNostrConnect({
  onConnect,
  onDisconnect,
}: {
  onConnect: (walletPubkey: string, relay: string, secretKey: string) => void;
  onDisconnect: () => void;
}) {
  useEffect(() => {
    const connect = new Connect({
      relay: nip46Relay,
      secretKey: nip46SecretKey,
    });

    const onConnectHandler = (pubkey: string) => {
      console.log("On Connect");
      console.log(pubkey);

      onConnect(pubkey, nip46Relay, nip46SecretKey);
    };

    connect.events.on("connect", onConnectHandler);
    connect.events.on("disconnect", onDisconnect);
    connect.init();

    return () => {
      connect.events.off("connect", onConnectHandler);
      connect.events.off("disconnect", onDisconnect);
    };
  }, [onConnect, onDisconnect]);

  const connectURI = new ConnectURI({
    target: publicKey,
    relay: nip46Relay,
    metadata: {
      name: "Noostr Workshop App",
      description: "My wonderful workshop",
      url: "https://nostr.workshop",
    },
  });

  return (
    <div className="flex flex-col gap-16 items-center">
      <h2 className="text-h3">Connect with any Nostr Connect signer</h2>

      <div
        style={{
          backgroundColor: "white",
          padding: "8px",
          height: "auto",
          maxWidth: 256,
          width: "100%",
        }}
      >
        <QRCode
          size={256}
          style={{ height: "auto", maxWidth: "100%", width: "100%" }}
          value={connectURI.toString()}
          viewBox={`0 0 256 256`}
        />
      </div>
      <div className="flex gap-16">
        <input
          type="text"
          className="w-full p-16 rounded"
          value={connectURI.toString()}
          readOnly
        />
        <CopyToClipboard text={connectURI.toString()}>
          <button className="bg-violet-500 px-16 py-4 rounded-8 font-bold hover:bg-violet-600 active:scale-90">
            Copy to clipboard
          </button>
        </CopyToClipboard>
      </div>
    </div>
  );
}

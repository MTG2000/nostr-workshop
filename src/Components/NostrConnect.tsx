import { Connect, ConnectURI } from "@nostr-connect/connect";
import { getPublicKey, nip19 } from "nostr-tools";
import { useEffect } from "react";
import QRCode from "react-qr-code";


export default function NostrConnect({
  onConnect,
  onDisconnect,
}: {
  onConnect: (walletPubkey: string) => void;
  onDisconnect: () => void;
}) {

  const nip46SecretKey = "ce04fe3398ff6cc9c81d3ec6f90555b65a0b492237ecf1895e16884c01a30d7b";
  const connectURI = new ConnectURI({
    target: getPublicKey(nip46SecretKey),
    relay: 'wss://nip46.vulpem.com',
    metadata: {
      name: 'Nostr Workshop',
      description: 'My wonderful workshop',
      url: 'https://nostr.workshop',
    },
  });

  useEffect(() => {
    (async () => {
      const connect = new Connect({ secretKey: nip46SecretKey, relay: 'wss://nip46.vulpem.com' });
      connect.events.on('connect', (pk: string) => {
        onConnect(pk);
      });
      connect.events.on('disconnect', onDisconnect);
      await connect.init();
    })();
  }, []);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(connectURI.toString()).then(undefined,
      function (err) {
        console.error('Async: Could not copy text: ', err);
      });
  }

  return (
    <>
      <h2 className='title is-5'>Connect with any Nostr Connect signer</h2>

      <div style={{ backgroundColor: 'white', padding: '8px', height: "auto", maxWidth: 256, width: "100%" }}>
        <QRCode
          size={256}
          style={{ height: "auto", maxWidth: "100%", width: "100%" }}
          value={connectURI.toString()}
          viewBox={`0 0 256 256`}
        />
      </div>
      <input
        type='text'
        value={connectURI.toString()}
        readOnly
      />
      <button className='bg-violet-500 px-16 py-4 rounded-8 font-bold hover:bg-violet-600 active:scale-90' onClick={copyToClipboard}>
        Copy to clipboard
      </button>
    </>
  )
}
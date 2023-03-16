# Nostr Connect Workshop

Let's add NIP46 Nostr Connect to the demo of [MTG2000's client](https://github.com/MTG2000/nostr-workshop).

1. **Clone the repository & install deps**

```sh 
git clone https://github.com/MTG2000/nostr-workshop
cd nostr-workshop
npm install
```

2. **Install extra deps**

```sh
npm install @nostr-connect/connect use-state-persist react-qr-code
```

3. **Add the Nostr Connect component**

In the `src/App.tsx` file, add the following:

```jsx
import { Connect } from '@nostr-connect/connect'
import { useStatePersist } from 'use-state-persist';
```

Persist the remote public key in the local storage:

```jsx
const [remotePubkey, setRemotePubkey] = useStatePersist<string | null>('@remote_pubkey', null);
```

Initialize the Connect instance on load and add the event listeners:

```jsx
  const nip46SecretKey = "ce04fe3398ff6cc9c81d3ec6f90555b65a0b492237ecf1895e16884c01a30d7b";
  const nip46Relay = "wss://nostr.vulpem.com";

  
  useEffect(() => {
    (async () => {
      const connect = new Connect({
        relay: nip46Relay,
        secretKey: nip46SecretKey,
      });
      connect.events.on('connect', onConnect);
      connect.events.on('disconnect', onDisconnect);
      await connect.init();
    })();
  }, []);


  const onConnect = (pubkey: string) => {
    setRemotePubkey(pubkey);
  };

  const onDisconnect = () => {
    setRemotePubkey(null);
  };

  const connectParams = {
    target: remotePubkey,
    relay: nip46Relay,
    secretKey: nip46SecretKey,
  }
```

In the `return` statement, branch the UI based on connection status:

```jsx
remotePubkey !== null && remotePubkey.length > 0 ? (
  <>
    <CreateNote pool={pool} hashtags={hashtags} />
    <HashtagsFilter hashtags={hashtags} onChange={setHashtags} />
    <NotesList metadata={metadata} notes={events} />
  </>
) : (
  <p> Nostr Connect QR Code will show here </p>
)
```

4. **Create a Nostr Connect component**

Create a new file `src/components/NostrConnect.tsx` and add the following:

```jsx
import { ConnectURI } from "@nostr-connect/connect";
import QRCode from "react-qr-code";


export default function NostrConnect({
  publicKey,
  relay,
  onConnect,
  onDisconnect,
}: {
  publicKey: string;
  relay: string;
  onConnect: (walletPubkey: string) => void;
  onDisconnect: () => void;
}) {


  const connectURI = new ConnectURI({
    target: publicKey,
    relay,
    metadata: {
      name: 'Nostr Workshop',
      description: 'My wonderful workshop',
      url: 'https://nostr.workshop',
    },
  });

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
```

5. **Add the Nostr Connect component to the UI**

In the `src/App.tsx` file, add the following in the `return` statement:


```jsx
<NostrConnect
  publicKey={getPublicKey(nip46SecretKey)}
  relay={nip46Relay}
  onConnect={onConnect}
  onDisconnect={onDisconnect}
/>
```

🎉 Hooray!  We can connect and disconnect now!

6. **Invoke Sign Event via connect**

In the `src/Components/CreateNote.tsx` file, add the following to `Props`:

```jsx
  connectParams: {
    target: string | null;
    relay: string;
    secretKey: string;
  }
```

In the `src/Components/CreateNote.tsx` file, replace `window.nostr` check in the `onSubmit` function:

```jsx
  if (!connectParams.target) {
    alert("You are not connected to any Nostr Connect signer");
    return;
  }
```

In the `src/Components/CreateNote.tsx` file, replace `sig` with connect method:

```jsx
const connect = new Connect({
  relay: connectParams.relay,
  secretKey: connectParams.secretKey,
  target: connectParams.target,
});

const pubkey = connectParams.target; // or await connect.getPublickey();
const event: Event = await connect.signEvent({..._baseEvent, pubkey});
```

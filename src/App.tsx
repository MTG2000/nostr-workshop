import { Connect } from "@nostr-connect/connect";
import { SimplePool, Event, nip19, getPublicKey } from "nostr-tools";
import { useEffect, useRef, useState } from "react";
import { useDebounce } from "use-debounce";
import { useStatePersist } from 'use-state-persist';
import "./App.css";
import CreateNote from "./Components/CreateNote";
import HashtagsFilter from "./Components/HashtagsFilter";
import NostrConnect from "./Components/NostrConnect";
import NotesList from "./Components/NotesList";
import { insertEventIntoDescendingList } from "./utils/helperFunctions";

const nip46SecretKey = "ce04fe3398ff6cc9c81d3ec6f90555b65a0b492237ecf1895e16884c01a30d7b";
const nip46Relay = "wss://nip46.vulpem.com";

export const RELAYS = [
  "wss://nostr-pub.wellorder.net",
  "wss://nostr.drss.io",
  "wss://nostr.swiss-enigma.ch",
  "wss://relay.damus.io",
];

export interface Metadata {
  name?: string;
  about?: string;
  picture?: string;
  nip05?: string;
}

function App() {
  const [pool, setPool] = useState<SimplePool | null>(null);

  const [eventsImmediate, setEvents] = useState<Event[]>([]);

  const [events] = useDebounce(eventsImmediate, 1500);

  const [metadata, setMetadata] = useState<Record<string, Metadata>>({});

  const metadataFetched = useRef<Record<string, boolean>>({});

  const [hashtags, setHashtags] = useState<string[]>([]);

  const [remotePubkey, setRemotePubkey] = useStatePersist<string | null>('@remote_pubkey', null);

  // setup a relays pool

  useEffect(() => {
    const _pool = new SimplePool();
    setPool(_pool);

    return () => {
      _pool.close(RELAYS);
    };
  }, []);

  // subscribe to some events
  useEffect(() => {
    if (!pool) return;

    setEvents([]);
    const sub = pool.sub(RELAYS, [
      {
        kinds: [1],
        limit: 100,
        "#t": hashtags,
      },
    ]);

    sub.on("event", (event: Event) => {
      setEvents((events) => insertEventIntoDescendingList(events, event));
    });

    return () => {
      sub.unsub();
    };
  }, [hashtags, pool]);

  useEffect(() => {
    if (!pool) return;

    const pubkeysToFetch = events
      .filter((event) => metadataFetched.current[event.pubkey] !== true)
      .map((event) => event.pubkey);

    pubkeysToFetch.forEach(
      (pubkey) => (metadataFetched.current[pubkey] = true)
    );

    const sub = pool.sub(RELAYS, [
      {
        kinds: [0],
        authors: pubkeysToFetch,
      },
    ]);

    sub.on("event", (event: Event) => {
      const metadata = JSON.parse(event.content) as Metadata;

      setMetadata((cur) => ({
        ...cur,
        [event.pubkey]: metadata,
      }));
    });

    sub.on("eose", () => {
      sub.unsub();
    });

    return () => { };
  }, [events, pool]);


  const connect = new Connect({
    secretKey: nip46SecretKey,
    relay: nip46Relay,
  });
  const [connectInstance] = useState(connect);



  useEffect(() => {
    (async () => {
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


  if (!pool) return null;


  return (
    <div className="app">
      <div className="flex flex-col gap-16">
        {
          remotePubkey !== null && remotePubkey.length > 0 ? (
            <>
              <h1 className="text-h1">Nostr Feed</h1>
              <p>{nip19.npubEncode(remotePubkey)}</p>
              <CreateNote pool={pool} hashtags={hashtags} connect={connect} />
              <HashtagsFilter hashtags={hashtags} onChange={setHashtags} />
              <NotesList metadata={metadata} notes={events} />
            </>
          ) : (
            <NostrConnect
              publicKey={getPublicKey(nip46SecretKey)}
              onConnect={onConnect}
              onDisconnect={onDisconnect}
            />
          )
        }
      </div>
    </div>
  );
}

export default App;

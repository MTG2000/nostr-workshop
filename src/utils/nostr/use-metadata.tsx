import { Event } from "nostr-tools";
import { useEffect, useRef, useState } from "react";
import { Metadata } from "../../types/nostr";
import { Relays } from "./relays";
import { useRelayPool } from "./use-relays-pool";

type Props =
  | {
      pubkeys: string[];
    }
  | {
      pubkey: string;
    };

export const useMetadata = (props: Props) => {
  const { relayPool: pool } = useRelayPool();

  const [metadata, setMetadata] = useState<Record<string, Metadata>>({});

  const metadataFetched = useRef<Record<string, boolean>>({});

  const propPubkey = "pubkey" in props ? props.pubkey : undefined;
  const propsPubkeys = "pubkeys" in props ? props.pubkeys : undefined;

  useEffect(() => {
    if (!pool) return;

    const pubkeysToFetch = (propsPubkeys ? propsPubkeys : [propPubkey!]).filter(
      (key) => metadataFetched.current[key] !== true
    );

    pubkeysToFetch.forEach(
      (pubkey) => (metadataFetched.current[pubkey] = true)
    );

    const sub = pool.sub(Relays.getRelays(), [
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

    return () => {};
  }, [pool, propsPubkeys, propPubkey]);

  return { metadata };
};

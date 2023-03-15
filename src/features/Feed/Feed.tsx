import { SimplePool, Event } from "nostr-tools";
import { useEffect, useRef, useState } from "react";
import { useDebounce } from "use-debounce";
import { RELAYS } from "../../App";
import CreateNote from "../../Components/CreateNote";
import HashtagsFilter from "../../Components/HashtagsFilter";
import NotesList from "../../Components/NotesList";
import { Metadata } from "../../types/nostr";
import { insertEventIntoDescendingList } from "../../utils/helperFunctions";

function Feed() {
  const [pool, setPool] = useState<SimplePool | null>(null);

  const [eventsImmediate, setEvents] = useState<Event[]>([]);

  const [events] = useDebounce(eventsImmediate, 1500);

  const [metadata, setMetadata] = useState<Record<string, Metadata>>({});

  const metadataFetched = useRef<Record<string, boolean>>({});

  const [hashtags, setHashtags] = useState<string[]>([]);

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

    return () => {};
  }, [events, pool]);

  if (!pool) return null;

  return (
    <div className="app">
      <div className="flex flex-col gap-16">
        <h1 className="text-h1 font-bolder text-violet-500">Feed</h1>
        <CreateNote pool={pool} hashtags={hashtags} />
        <HashtagsFilter hashtags={hashtags} onChange={setHashtags} />
        <NotesList metadata={metadata} notes={events} />
      </div>
    </div>
  );
}

export default Feed;

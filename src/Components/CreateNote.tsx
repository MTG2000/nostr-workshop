import { useState } from "react";
import { Event, getEventHash, SimplePool, UnsignedEvent } from "nostr-tools";
import { Relays } from "../utils/nostr/relays";
import { useNostrConnection } from "../utils/nostr/use-nostr-connection";

interface Props {
  pool: SimplePool;
  hashtags: string[];
}

export default function CreateNote({ pool, hashtags }: Props) {
  const [input, setInput] = useState("");

  const { connection: nostrConnection, signEvent } = useNostrConnection();

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!nostrConnection) throw new Error("Nostr Connection not found");

    // Construct the event object
    const _baseEvent = {
      content: input,
      created_at: Math.round(Date.now() / 1000),
      kind: 1,
      tags: [...hashtags.map((hashtag) => ["t", hashtag])],
      pubkey: nostrConnection.pubkey,
    } as UnsignedEvent;

    // Sign this event (allow the user to sign it with their private key)
    // // check if the user has a nostr extension
    try {
      const sig = await signEvent(_baseEvent);
      const event: Event = {
        ..._baseEvent,
        sig,
        id: getEventHash({ ..._baseEvent }),
      };

      const pubs = pool.publish(Relays.getRelays(), event);

      let clearedInput = false;

      pubs.on("ok", () => {
        if (clearedInput) return;

        clearedInput = true;
        setInput("");
      });
    } catch (error) {
      alert("User rejected operation");
    }
  };

  return (
    <div>
      <h2 className="text-h3 text-white mb-12">What's In Your Mind??</h2>
      <form onSubmit={onSubmit}>
        <textarea
          placeholder="Write your note here..."
          className="w-full p-12 rounded"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          rows={6}
        />
        <div className="flex justify-end">
          <button className="bg-violet-500 px-16 py-4 rounded-8 font-bold hover:bg-violet-600 active:scale-90">
            Publish
          </button>
        </div>
      </form>
    </div>
  );
}

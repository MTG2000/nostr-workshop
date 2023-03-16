import { useState } from "react";
import { EventTemplate, Event, getEventHash, SimplePool } from "nostr-tools";
import { RELAYS } from "../App";
import { Connect } from "@nostr-connect/connect";

interface Props {
  pool: SimplePool;
  hashtags: string[];
  connectParams: {
    target: string | null;
    relay: string;
    secretKey: string;
  }
}

export default function CreateNote({ pool, hashtags, connectParams }: Props) {
  const [input, setInput] = useState("");

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!connectParams.target) {
      alert("You are not connected to any Nostr Connect signer");
      return;
    }
    // Construct the event object
    const _baseEvent = {
      content: input,
      created_at: Math.round(Date.now() / 1000),
      kind: 1,
      tags: [...hashtags.map((hashtag) => ["t", hashtag])],
    } as EventTemplate;

    // Sign this event (allow the user to sign it with their private key)
    // // check if the user has a nostr extension
    try {
      const connect = new Connect({
        relay: connectParams.relay,
        secretKey: connectParams.secretKey,
        target: connectParams.target,
      });
      const pubkey = connectParams.target;
      const event: Event = await connect.signEvent({..._baseEvent, pubkey});


      const pubs = pool.publish(RELAYS, event);

      let clearedInput = false;

      pubs.on("ok", () => {
        if (clearedInput) return;

        clearedInput = true;
        setInput("");

        console.log("Published event", event.id);
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

import { Event, EventTemplate, getEventHash } from "nostr-tools";
import React, { useEffect, useMemo, useState } from "react";
import {
  getProfileDataFromMetaData,
  insertEventIntoDescendingList,
} from "../../utils/helperFunctions";
import { DecryptionQueue } from "../../utils/nostr/decryptionQueue";
import { Relays } from "../../utils/nostr/relays";
import { useMetadata } from "../../utils/nostr/use-metadata";
import { useNostrConnection } from "../../utils/nostr/use-nostr-connection";
import { useRelayPool } from "../../utils/nostr/use-relays-pool";

interface Props {
  currentOpenContact: string;
}

export default function MessagesContainer({ currentOpenContact }: Props) {
  const { relayPool } = useRelayPool();

  const [msgInput, setMsgInput] = useState("");

  const [messages, setMessages] = useState<Event[]>([]);

  const { connection: nostrConnection } = useNostrConnection();

  const myPubkey = nostrConnection?.pubkey;

  const pubkeysToFetch = useMemo(
    () => [currentOpenContact],
    [currentOpenContact]
  );

  const { metadata } = useMetadata({ pubkeys: pubkeysToFetch });

  if (!myPubkey) throw new Error("Nostr Connection not found");

  useEffect(() => {
    if (!relayPool) return;

    const sub = relayPool.sub(Relays.getRelays(), [
      {
        kinds: [4],
        limit: 100,
        "#p": [currentOpenContact],
        authors: [myPubkey],
      },
      {
        kinds: [4],
        limit: 100,
        "#p": [myPubkey],
        authors: [currentOpenContact],
      },
    ]);

    const onEvent = async (event: Event) => {
      DecryptionQueue.add(event.content, currentOpenContact, (err, msg) => {
        if (err) {
          return console.log(err);
        }

        const decryptedEvent = {
          ...event,
          content: msg,
        } as Event;
        setMessages((messages) =>
          insertEventIntoDescendingList(messages, decryptedEvent)
        );
      });
    };

    sub.on("event", onEvent);

    return () => {
      sub.unsub();
      sub.off("event", onEvent);
      DecryptionQueue.clear();
    };
  }, [currentOpenContact, myPubkey, relayPool]);

  const sendMessage = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!window.nostr) {
      alert("Nostr extension not found");
      return;
    }
    // Construct the event object
    const encryptedContent = await window.nostr.nip04?.encrypt(
      currentOpenContact,
      msgInput
    );

    const _baseEvent = {
      content: encryptedContent,
      created_at: Math.round(Date.now() / 1000),
      kind: 4,
      tags: [["p", currentOpenContact]],
    } as EventTemplate;

    try {
      const pubkey = await window.nostr.getPublicKey();

      const sig = await (await window.nostr.signEvent(_baseEvent)).sig;

      const event: Event = {
        ..._baseEvent,
        sig,
        pubkey,
        id: getEventHash({ ..._baseEvent, pubkey }),
      };

      const pubs = relayPool!.publish(Relays.getRelays(), event);

      let clearedInput = false;

      pubs.on("ok", () => {
        if (clearedInput) return;

        clearedInput = true;
        setMsgInput("");
      });
    } catch (error) {
      alert("User rejected operation");
    }
  };

  return (
    <>
      <div className="grow flex flex-col">
        {currentOpenContact && (
          <p className="text-body3 bg-gray-900 p-24 overflow-hidden text-ellipsis font-bold flex items-center">
            <img
              src={
                getProfileDataFromMetaData(metadata, currentOpenContact).image
              }
              className="rounded-full w-42 h-42 mr-16 bg-gray-300 border border-gray-400"
              alt=""
            />{" "}
            {getProfileDataFromMetaData(metadata, currentOpenContact).name}
          </p>
        )}
        <div className="flex flex-col-reverse grow gap-8 py-16">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex flex-col gap-4 rounded-24 px-16 py-8 ${
                message.pubkey === myPubkey
                  ? "self-start bg-gradient-to-br from-indigo-500 via-purple-500 to-purple-600 "
                  : "self-end bg-gray-700"
              }`}
            >
              <p className="text-body3">{message.content}</p>
            </div>
          ))}
        </div>
      </div>
      {currentOpenContact && (
        <form onSubmit={sendMessage} className="flex w-full gap-16">
          <input
            className="grow p-16"
            type="text"
            placeholder="Type your message here..."
            value={msgInput}
            onChange={(e) => setMsgInput(e.target.value)}
          />
          <button className="bg-violet-500 text-body3 px-16 py-4 shrink-0 rounded-8 font-bold hover:bg-violet-600 active:scale-90">
            Send Message 📧
          </button>
        </form>
      )}
    </>
  );
}

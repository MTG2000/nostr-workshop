import { nip19 } from "nostr-tools";
import React, { useMemo } from "react";
import { useStatePersist } from "use-state-persist";
import { getProfileDataFromMetaData } from "../../utils/helperFunctions";
import { useMetadata } from "../../utils/nostr/use-metadata";

interface Props {
  pubkey: string;
  currentOpenContact: string;
  onOpenContact?: (pubkey: string) => void;
}

export default function ContactsList({
  pubkey,
  currentOpenContact,
  onOpenContact,
}: Props) {
  const [contacts, setContacts] = useStatePersist<Contact[]>(
    `contacts:${pubkey}`,
    []
  );

  const pubkeysToFetch = useMemo(
    () => contacts.map((contact) => contact.pubkey),
    [contacts]
  );

  const { metadata } = useMetadata({ pubkeys: pubkeysToFetch });

  const [newContact, setNewContact] = React.useState("");

  function onAddContact(e: React.FormEvent) {
    e.preventDefault();
    if (!newContact) return;

    let hexPubkey = newContact;

    if (newContact.startsWith("npub"))
      hexPubkey = nip19.decode(newContact).data as string;

    setContacts((contacts) => {
      if (contacts.find((contact) => contact.pubkey === hexPubkey))
        return contacts;
      const newContacts = [...contacts, { pubkey: hexPubkey }];
      return newContacts;
    });
    onOpenContact?.(hexPubkey);

    setNewContact("");
  }

  return (
    <div className="flex flex-col gap-24">
      {contacts.length === 0 && (
        <p className="text-body3 text-center">No contacts yet</p>
      )}
      {contacts.length > 0 && (
        <ul>
          {contacts.map((contact, i) => {
            const profileData = getProfileDataFromMetaData(
              metadata,
              contact.pubkey
            );
            return (
              <li key={i} className="overflow-hidden">
                <button
                  className={`text-ellipsis overflow-hidden w-full p-16 flex gap-12 text-left ${
                    currentOpenContact === contact.pubkey
                      ? "bg-violet-400 bg-opacity-50"
                      : "hover:bg-gray-100 hover:bg-opacity-10 active:bg-opacity-20 active:scale-95"
                  }`}
                  onClick={() => onOpenContact?.(contact.pubkey)}
                >
                  <img
                    src={profileData.image}
                    className="shrink-0 bg-gray-200 w-42 aspect-square rounded-full border border-gray-400"
                    alt=""
                  />
                  <div className="overflow-hidden">
                    <p className="text-body3 font-bold overflow-hidden text-ellipsis">
                      {profileData.name}
                    </p>
                    <p className="text-body5 text-gray-400 overflow-hidden text-ellipsis">
                      {profileData.pubkey}
                    </p>
                  </div>
                </button>
              </li>
            );
          })}
        </ul>
      )}
      <hr />
      <form onSubmit={onAddContact}>
        <input
          type="text"
          className="w-full mb-16 p-8"
          placeholder="Enter a public HEX key"
          value={newContact}
          onChange={(e) => setNewContact(e.target.value)}
        />
        <button className="bg-violet-500 text-body3 px-16 py-4 rounded-8 font-bold hover:bg-violet-600 active:scale-90 w-full">
          Add New Contact
        </button>
      </form>
    </div>
  );
}

export interface Contact {
  pubkey: string;
}

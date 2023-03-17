import { useState } from "react";
import { useNostrConnection } from "../../utils/nostr/use-nostr-connection";
import ContactsList from "./ContactsList";
import MessagesContainer from "./MessagesContainer";

export default function DirectMessaging() {
  const { connection: nostrConnection } = useNostrConnection();

  const [currentOpenContact, setCurrentOpenContact] = useState("");

  if (nostrConnection === null) throw new Error("Nostr connection not found");

  console.log(currentOpenContact);

  return (
    <div className="max-w-[130ch] mx-auto px-16">
      <h1 className="text-h1 font-bolder text-violet-509">Direct Messaging</h1>
      <div className="grid gap-16 grid-cols-3">
        <div className="col-span-1">
          <p className="text-body1 mb-24">My Contacts</p>
          <ContactsList
            pubkey={nostrConnection.pubkey}
            currentOpenContact={currentOpenContact}
            onOpenContact={setCurrentOpenContact}
          />
        </div>
        <div className="col-span-2 h-[min(60vh,800px)] bg-gray-900 bg-opacity-30 rounded p-16 flex flex-col ">
          <MessagesContainer
            key={currentOpenContact}
            currentOpenContact={currentOpenContact}
          />
        </div>
      </div>
    </div>
  );
}

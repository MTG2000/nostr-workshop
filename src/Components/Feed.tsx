import NotesList from "./NotesList";

export const RELAYS = [
  "wss://nostr-pub.wellorder.net",
  "wss://nostr.drss.io",
  "wss://nostr.swiss-enigma.ch",
  "wss://relay.damus.io",
];

export default function Feed() {
  return (
    <div className="flex flex-col gap-16">
      <NotesList notes={[]} />
    </div>
  );
}

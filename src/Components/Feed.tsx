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
      <h1 className="text-h1">Feed</h1>
      <NotesList notes={[]} />
    </div>
  );
}

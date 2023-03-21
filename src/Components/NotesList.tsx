import { Event, nip19 } from "nostr-tools";
import { Metadata } from "../types/nostr";
import NoteCard from "./NoteCard";

interface Props {
  notes: Event[];
  metadata: Record<string, Metadata>;
}

export default function NotesList({ notes, metadata }: Props) {
  return (
    <div className="flex flex-col gap-16">
      {notes.map((note) => (
        <NoteCard
          created_at={note.created_at}
          user={{
            name:
              metadata[note.pubkey]?.name ??
              `${nip19.npubEncode(note.pubkey).slice(0, 12)}...`,
            image:
              metadata[note.pubkey]?.picture ??
              `https://api.dicebear.com/5.x/identicon/svg?seed=${note.pubkey}`,
            pubkey: note.pubkey,
          }}
          key={note.id}
          content={note.content}
          hashtags={note.tags.filter((t) => t[0] === "t").map((t) => t[1])}
        />
      ))}
    </div>
  );
}

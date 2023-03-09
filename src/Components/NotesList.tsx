import NoteCard from "./NoteCard";

interface Props {
  notes: any[];
}

export default function NotesList({ notes }: Props) {
  return (
    <div className="flex flex-col gap-16">
      {notes.map((note) => (
        <NoteCard key={note.id} content={note.content} />
      ))}
    </div>
  );
}

interface Props {
  content: string;
  user: {
    name: string;
    image: string;
    pubkey: string;
  };
  created_at: number;
  hashtags: string[];
}

export default function NoteCard({
  content,
  user,
  created_at,
  hashtags,
}: Props) {
  return (
    <div className="rounded p-16 border border-gray-600 bg-gray-700 flex flex-col gap-16 break-words">
      <div className="flex gap-12 items-center overflow-hidden">
        <img
          src={user.image}
          alt="note"
          className="rounded-full w-40 aspect-square bg-gray-100"
        />
        <div>
          <a
            href={`https://nostr.guru/p/${user.pubkey}`}
            className="text-body3 text-white overflow-hidden text-ellipsis"
            target="_blank"
            rel="noreferrer"
          >
            {user.name}
          </a>
          <p className="text-body5 text-gray-400">
            {new Date(created_at * 1000).toISOString().split("T")[0]}
          </p>
        </div>
      </div>
      <p>{content}</p>
      <ul className="flex flex-wrap gap-12">
        {hashtags
          .filter((t) => hashtags.indexOf(t) === hashtags.lastIndexOf(t))
          .map((hashtag) => (
            <li
              key={hashtag}
              className="bg-gray-300 text-body5 text-gray-900 font-medium rounded-24 px-12 py-4"
            >
              #{hashtag}
            </li>
          ))}
      </ul>
    </div>
  );
}

import { nip19 } from "nostr-tools";
import { Link } from "react-router-dom";
import { CopyToClipboard } from "react-copy-to-clipboard";

interface Props {
  pubkey: string;
}

export default function Navbar({ pubkey }: Props) {
  return (
    <nav className=" p-24 bg-gray-900 sticky top-0 left-0 w-full">
      <div className="flex gap-24 items-center max-w-[900px] mx-auto">
        <p className="text-h3 font-bold">Nooostr Client</p>

        <CopyToClipboard text={pubkey} onCopy={() => alert("Copied!!")}>
          <button className="ml-auto hover:bg-gray-100 hover:bg-opacity-10 px-4">
            {nip19.npubEncode(pubkey).slice(0, 12)}...
          </button>
        </CopyToClipboard>
        <ul className="flex gap-16 text-white">
          <li className="text-body1 text-white">
            <Link to="/feed">Feed</Link>
          </li>
          <li className="text-body1 text-white">
            <Link to="/dm">DMs</Link>
          </li>
        </ul>
      </div>
    </nav>
  );
}

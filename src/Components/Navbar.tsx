import { Link } from "react-router-dom";
import { CopyToClipboard } from "react-copy-to-clipboard";
import { useMetadata } from "../utils/nostr/use-metadata";
import { getProfileDataFromMetaData } from "../utils/helperFunctions";
import { useNostrConnection } from "../utils/nostr/use-nostr-connection";

export default function Navbar() {
  const { connection, setConnection } = useNostrConnection();

  const pubkey = connection?.pubkey;

  if (!pubkey) throw new Error("You are not logged in");

  const { metadata } = useMetadata({ pubkey });

  const logout = () => {
    setConnection(null);
  };

  return (
    <nav className=" p-24 bg-gray-900 sticky top-0 left-0 w-full">
      <div className="flex gap-24 items-center max-w-[900px] mx-auto">
        <p className="text-h3 font-bold">Nooostr Client</p>

        <ul className="flex gap-16 text-white ml-auto mx-24">
          <li className="text-body1 text-white">
            <Link to="/feed">Feed</Link>
          </li>
          <li className="text-body1 text-white">
            <Link to="/dm">DMs</Link>
          </li>
        </ul>

        <CopyToClipboard
          text={pubkey}
          onCopy={() => alert("Copied My Pubkey!")}
        >
          <img
            src={getProfileDataFromMetaData(metadata, pubkey).image}
            className="rounded-full w-32 h-32  bg-gray-300 border border-gray-400"
            alt=""
          />
        </CopyToClipboard>

        <button
          className=" hover:bg-gray-100 hover:bg-opacity-10 p-8 rounded"
          onClick={logout}
        >
          Logout 🚪
        </button>
      </div>
    </nav>
  );
}

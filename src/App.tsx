import "./App.css";
import ConnectAccount, {
  NostrAccountConnection,
} from "./Components/ConnectAccount";
import Navbar from "./Components/Navbar";
import Feed from "./features/Feed/Feed";
import { Outlet } from "react-router-dom";
import { useState } from "react";

export const RELAYS = [
  "wss://nostr-pub.wellorder.net",
  "wss://nostr.drss.io",
  "wss://nostr.swiss-enigma.ch",
  "wss://relay.damus.io",
];

function App() {
  const [nostrConnection, setNostrConnection] = useState(() =>
    getNostrConnection()
  );

  if (nostrConnection === null)
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <ConnectAccount onConnected={setNostrConnection} />
      </div>
    );

  return (
    <div className="app">
      <Navbar pubkey={nostrConnection.pubkey} />
      <div className="page">
        <Outlet />
      </div>
    </div>
  );
}

function getNostrConnection() {
  const connection = sessionStorage.getItem("nostr-connection");
  if (connection === null) return null;
  return JSON.parse(connection) as NostrAccountConnection;
}

export default App;

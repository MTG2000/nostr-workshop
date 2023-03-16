import "./App.css";
import ConnectAccount from "./Components/ConnectAccount";
import Navbar from "./Components/Navbar";
import { Outlet } from "react-router-dom";
import { useNostrConnection } from "./utils/nostr/use-nostr-connection";

function App() {
  const { connection: nostrConnection } = useNostrConnection();

  if (nostrConnection === null)
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <ConnectAccount />
      </div>
    );

  return (
    <div className="app">
      <Navbar pubkey={nostrConnection.pubkey} />
      <Outlet />
    </div>
  );
}

export default App;

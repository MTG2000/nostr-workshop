import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import { RouterProvider } from "react-router-dom";
import { router } from "./router";
import { RelayPoolProvider } from "./utils/nostr/use-relays-pool";
import { NostrConnectionProvider } from "./utils/nostr/use-nostr-connection";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <RelayPoolProvider>
      <NostrConnectionProvider>
        <RouterProvider router={router} />
      </NostrConnectionProvider>
    </RelayPoolProvider>
  </React.StrictMode>
);

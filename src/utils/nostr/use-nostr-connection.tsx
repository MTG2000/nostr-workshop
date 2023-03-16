import {
  createContext,
  PropsWithChildren,
  useContext,
  useEffect,
  useState,
} from "react";
import { useStatePersist } from "use-state-persist";

export type NostrAccountConnection =
  | {
      type: "nostr-ext";
      pubkey: string;
    }
  | {
      type: "generated-keys";
      prvkey: string;
      pubkey: string;
    }
  | {
      type: "inputted-keys";
      pubkey: string;
      prvkey: string;
    };

interface State {
  connection: NostrAccountConnection | null;
  setConnection: (connection: NostrAccountConnection | null) => void;
}

const NostrConnectionContext = createContext<State | null>(null);

export const NostrConnectionProvider = (props: PropsWithChildren<{}>) => {
  const [connection, setConnection] =
    useStatePersist<NostrAccountConnection | null>("nostr-connection", null);

  return (
    <NostrConnectionContext.Provider
      value={{
        connection,
        setConnection,
      }}
    >
      {props.children}
    </NostrConnectionContext.Provider>
  );
};

export const useNostrConnection = () => {
  const result = useContext(NostrConnectionContext);

  if (!result) throw new Error("No Nostr Connection Provider was found");

  return result;
};

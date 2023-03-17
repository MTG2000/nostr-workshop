import { signEvent as nostrSignEvent, UnsignedEvent, nip04 } from "nostr-tools";
import {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
} from "react";
import { useStatePersist } from "use-state-persist";
import { DecryptionQueue } from "./decryptionQueue";

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
  signEvent: (event: UnsignedEvent) => Promise<string>;
  encryptMessage: (msg: string, theirPublicKey: string) => Promise<string>;
  decryptMessage: (msg: string, theirPublicKey: string) => Promise<string>;
}

const NostrConnectionContext = createContext<State | null>(null);

export const NostrConnectionProvider = (props: PropsWithChildren<{}>) => {
  const [connection, setConnection] =
    useStatePersist<NostrAccountConnection | null>("nostr-connection", null);

  const signEvent = useCallback(
    async (event: UnsignedEvent) => {
      if (!connection) throw new Error("Nostr Connection not found");

      if (connection.type === "nostr-ext") {
        return (await window.nostr.signEvent(event)).sig;
      } else if (
        connection.type === "generated-keys" ||
        connection.type === "inputted-keys"
      ) {
        return nostrSignEvent(event, connection.prvkey);
      }

      throw new Error("Invalid Nostr Connection Type");
    },
    [connection]
  );

  const encryptMessage = useCallback(
    async (msg: string, theirPublicKey: string) => {
      if (!connection) throw new Error("Nostr Connection not found");

      if (connection.type === "nostr-ext") {
        if (!window.nostr.nip04)
          throw new Error("Your Nostr extension doesn't support NIP04...");

        return window.nostr.nip04.encrypt(theirPublicKey, msg);
      } else if (
        connection.type === "generated-keys" ||
        connection.type === "inputted-keys"
      ) {
        return nip04.encrypt(connection.prvkey, theirPublicKey, msg);
      }

      throw new Error("Invalid Nostr Connection Type");
    },
    [connection]
  );

  const decryptMessage = useCallback(
    async (msg: string, theirPublicKey: string) => {
      if (!connection) throw new Error("Nostr Connection not found");

      if (connection.type === "nostr-ext") {
        if (!window.nostr.nip04)
          throw new Error("Your Nostr extension doesn't support NIP04...");

        return window.nostr.nip04.decrypt(theirPublicKey, msg);
      } else if (
        connection.type === "generated-keys" ||
        connection.type === "inputted-keys"
      ) {
        return nip04.decrypt(connection.prvkey, theirPublicKey, msg);
      }

      throw new Error("Invalid Nostr Connection Type");
    },
    [connection]
  );

  useEffect(() => {
    DecryptionQueue.setDecryptFn(decryptMessage);
  }, [decryptMessage]);

  return (
    <NostrConnectionContext.Provider
      value={{
        connection,
        setConnection,
        signEvent,
        encryptMessage,
        decryptMessage,
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

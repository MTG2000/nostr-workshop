import { SimplePool } from "nostr-tools";
import {
  createContext,
  PropsWithChildren,
  useContext,
  useEffect,
  useState,
} from "react";
import { Relays } from "./relays";

interface State {
  relayPool: SimplePool | null;
}

const RelayPoolContext = createContext<State | null>(null);

export const RelayPoolProvider = (props: PropsWithChildren<{}>) => {
  const [relayPool, setRelayPool] = useState<SimplePool | null>(null);

  useEffect(() => {
    const _pool = new SimplePool();
    setRelayPool(_pool);

    return () => {
      _pool.close(Relays.getRelays());
    };
  }, []);

  return (
    <RelayPoolContext.Provider
      value={{
        relayPool,
      }}
    >
      {props.children}
    </RelayPoolContext.Provider>
  );
};

export const useRelayPool = () => {
  const result = useContext(RelayPoolContext);

  if (!result) throw new Error("No Relay Pool Provider was found");

  return result;
};

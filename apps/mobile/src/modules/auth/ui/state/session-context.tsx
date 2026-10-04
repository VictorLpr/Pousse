import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type PropsWithChildren,
} from 'react';

import type { Household } from '@/modules/auth/domain/entities/household';
import type { ParentAccount } from '@/modules/auth/domain/entities/parent-account';
import { useServices } from '@/di/services-provider';

interface SessionContextValue {
  readonly account: ParentAccount | null;
  readonly household: Household | null;
  /** Returns the account's household, or null if it is still to be created. */
  signIn(email: string, password: string): Promise<Household | null>;
  register(email: string, password: string): Promise<void>;
  createHousehold(name: string): Promise<void>;
  signOut(): void;
}

const SessionContext = createContext<SessionContextValue | null>(null);

export function SessionProvider({ children }: PropsWithChildren) {
  const services = useServices();
  const [account, setAccount] = useState<ParentAccount | null>(null);
  const [household, setHousehold] = useState<Household | null>(null);

  const signIn = useCallback(
    async (email: string, password: string) => {
      const result = await services.signInParent.execute(email, password);
      setAccount(result.account);
      setHousehold(result.household);
      return result.household;
    },
    [services],
  );

  const register = useCallback(
    async (email: string, password: string) => {
      setAccount(await services.registerParent.execute(email, password));
      setHousehold(null);
    },
    [services],
  );

  const createHousehold = useCallback(
    async (name: string) => {
      if (!account) {
        throw new Error('No signed-in account.');
      }
      setHousehold(await services.createHousehold.execute(account.id, name));
    },
    [services, account],
  );

  const signOut = useCallback(() => {
    setAccount(null);
    setHousehold(null);
  }, []);

  const value = useMemo(
    () => ({ account, household, signIn, register, createHousehold, signOut }),
    [account, household, signIn, register, createHousehold, signOut],
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession(): SessionContextValue {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error('useSession must be used within a SessionProvider.');
  }
  return context;
}

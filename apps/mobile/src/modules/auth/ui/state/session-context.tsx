import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from 'react';

import type { ParentProfile } from '@/modules/auth/domain/entities/parent-account';
import { useServices } from '@/di/services-provider';

interface SessionContextValue {
  /** The signed-in parent; the household is this parent and their children. */
  readonly account: ParentProfile | null;
  signIn(email: string, password: string): Promise<ParentProfile>;
  register(email: string, password: string): Promise<void>;
  /** Sets the last name the household is named after. */
  updateLastName(lastName: string): Promise<void>;
  signOut(): Promise<void>;
}

const SessionContext = createContext<SessionContextValue | null>(null);

export function SessionProvider({ children }: PropsWithChildren) {
  const services = useServices();
  const [account, setAccount] = useState<ParentProfile | null>(null);
  const [isRestoring, setIsRestoring] = useState(true);

  useEffect(() => {
    let cancelled = false;
    services.restoreSession
      .execute()
      // An unreachable server leaves the parent signed out: the login
      // screen is where they can try again.
      .catch(() => null)
      .then((restored) => {
        if (!cancelled) {
          setAccount(restored);
          setIsRestoring(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [services]);

  const signIn = useCallback(
    async (email: string, password: string) => {
      const signedIn = await services.signInParent.execute(email, password);
      setAccount(signedIn);
      return signedIn;
    },
    [services],
  );

  const register = useCallback(
    async (email: string, password: string) => {
      setAccount(await services.registerParent.execute(email, password));
    },
    [services],
  );

  const updateLastName = useCallback(
    async (lastName: string) => {
      if (!account) {
        throw new Error('No signed-in account.');
      }
      setAccount(await services.updateParentName.execute(account, { lastName }));
    },
    [services, account],
  );

  const signOut = useCallback(async () => {
    await services.signOutParent.execute();
    setAccount(null);
  }, [services]);

  const value = useMemo(
    () => ({ account, signIn, register, updateLastName, signOut }),
    [account, signIn, register, updateLastName, signOut],
  );

  // Screens render once the session is known, so a guard never redirects a
  // parent whose session is still being restored.
  return (
    <SessionContext.Provider value={value}>{isRestoring ? null : children}</SessionContext.Provider>
  );
}

export function useSession(): SessionContextValue {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error('useSession must be used within a SessionProvider.');
  }
  return context;
}

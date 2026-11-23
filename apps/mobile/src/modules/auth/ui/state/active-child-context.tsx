import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type PropsWithChildren,
} from 'react';

import type { Child } from '@/modules/auth/domain/entities/child';
import { useServices } from '@/di/services-provider';

interface ActiveChildContextValue {
  readonly activeChild: Child | null;
  /** True while `selectChild` fetches the child; screens wait instead of redirecting. */
  readonly isLoading: boolean;
  /** Fetches the child and makes it active; rejects when it can't be loaded. */
  selectChild(childId: string): Promise<void>;
  adoptChild(child: Child): void;
  clearActiveChild(): void;
}

const ActiveChildContext = createContext<ActiveChildContextValue | null>(null);

export function ActiveChildProvider({ children }: PropsWithChildren) {
  const services = useServices();
  const [activeChild, setActiveChild] = useState<Child | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  // Only the latest selection lands: an older answer arriving late is dropped.
  const latestSelection = useRef(0);

  const selectChild = useCallback(
    async (childId: string) => {
      const selection = ++latestSelection.current;
      const isLatest = () => selection === latestSelection.current;
      setIsLoading(true);
      try {
        const child = await services.getChild.execute(childId);
        if (isLatest()) {
          setActiveChild(child);
        }
      } catch (error) {
        if (isLatest()) {
          throw error;
        }
      } finally {
        if (isLatest()) {
          setIsLoading(false);
        }
      }
    },
    [services],
  );

  const adoptChild = useCallback((child: Child) => {
    latestSelection.current += 1;
    setIsLoading(false);
    setActiveChild(child);
  }, []);

  const clearActiveChild = useCallback(() => {
    latestSelection.current += 1;
    setIsLoading(false);
    setActiveChild(null);
  }, []);

  const value = useMemo(
    () => ({ activeChild, isLoading, selectChild, adoptChild, clearActiveChild }),
    [activeChild, isLoading, selectChild, adoptChild, clearActiveChild],
  );

  return <ActiveChildContext.Provider value={value}>{children}</ActiveChildContext.Provider>;
}

export function useActiveChild(): ActiveChildContextValue {
  const context = useContext(ActiveChildContext);
  if (!context) {
    throw new Error('useActiveChild must be used within an ActiveChildProvider.');
  }
  return context;
}

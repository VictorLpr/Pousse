import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type PropsWithChildren,
} from 'react';

import type { Child } from '@/modules/auth/domain/entities/child';
import { useServices } from '@/di/services-provider';

interface ActiveChildContextValue {
  readonly activeChild: Child | null;
  /** Conservé pour les gardes d'écrans ; l'enfant actif est choisi sur la page du foyer. */
  readonly isLoading: boolean;
  selectChild(childId: string): Promise<void>;
  adoptChild(child: Child): void;
  clearActiveChild(): void;
}

const ActiveChildContext = createContext<ActiveChildContextValue | null>(null);

export function ActiveChildProvider({ children }: PropsWithChildren) {
  const services = useServices();
  const [activeChild, setActiveChild] = useState<Child | null>(null);

  const selectChild = useCallback(
    async (childId: string) => {
      setActiveChild(await services.getChild.execute(childId));
    },
    [services],
  );

  const adoptChild = useCallback((child: Child) => {
    setActiveChild(child);
  }, []);

  const clearActiveChild = useCallback(() => {
    setActiveChild(null);
  }, []);

  const value = useMemo(
    () => ({ activeChild, isLoading: false, selectChild, adoptChild, clearActiveChild }),
    [activeChild, selectChild, adoptChild, clearActiveChild],
  );

  return <ActiveChildContext.Provider value={value}>{children}</ActiveChildContext.Provider>;
}

export function useActiveChild(): ActiveChildContextValue {
  const context = useContext(ActiveChildContext);
  if (!context) {
    throw new Error('useActiveChild doit être utilisé dans un ActiveChildProvider.');
  }
  return context;
}

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type PropsWithChildren,
} from 'react';

import type { Child } from '@/domain/entities/child';
import { useServices } from '@/di/services-provider';

interface ActiveChildContextValue {
  readonly activeChild: Child | null;
  readonly isLoading: boolean;
  selectChild(childId: string): Promise<void>;
  adoptChild(child: Child): void;
  refreshActiveChild(): Promise<void>;
}

const ActiveChildContext = createContext<ActiveChildContextValue | null>(null);

export function ActiveChildProvider({ children }: PropsWithChildren) {
  const services = useServices();
  const [activeChild, setActiveChild] = useState<Child | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    services.listChildren.execute().then((allChildren) => {
      if (isMounted) {
        setActiveChild(allChildren[0] ?? null);
        setIsLoading(false);
      }
    });
    return () => {
      isMounted = false;
    };
  }, [services]);

  const selectChild = useCallback(
    async (childId: string) => {
      setActiveChild(await services.getChild.execute(childId));
    },
    [services],
  );

  const adoptChild = useCallback((child: Child) => {
    setActiveChild(child);
  }, []);

  const refreshActiveChild = useCallback(async () => {
    if (activeChild) {
      setActiveChild(await services.getChild.execute(activeChild.id));
    }
  }, [services, activeChild]);

  return (
    <ActiveChildContext.Provider
      value={{ activeChild, isLoading, selectChild, adoptChild, refreshActiveChild }}>
      {children}
    </ActiveChildContext.Provider>
  );
}

export function useActiveChild(): ActiveChildContextValue {
  const context = useContext(ActiveChildContext);
  if (!context) {
    throw new Error('useActiveChild doit être utilisé dans un ActiveChildProvider.');
  }
  return context;
}

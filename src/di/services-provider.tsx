import { createContext, useContext, useRef, type PropsWithChildren } from 'react';

import { createAppServices, type AppServices } from './container';

const ServicesContext = createContext<AppServices | null>(null);

export function ServicesProvider({ children }: PropsWithChildren) {
  const servicesRef = useRef<AppServices | null>(null);
  servicesRef.current ??= createAppServices();

  return (
    <ServicesContext.Provider value={servicesRef.current}>{children}</ServicesContext.Provider>
  );
}

export function useServices(): AppServices {
  const services = useContext(ServicesContext);
  if (!services) {
    throw new Error('useServices doit être utilisé dans un ServicesProvider.');
  }
  return services;
}

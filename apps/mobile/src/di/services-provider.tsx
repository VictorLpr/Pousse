import { createContext, useContext, useState, type PropsWithChildren } from 'react';

import { createAppServices, type AppServices } from './container';

const ServicesContext = createContext<AppServices | null>(null);

export function ServicesProvider({ children }: PropsWithChildren) {
  // Lazy initialization: the container is created only once per mount.
  const [services] = useState(createAppServices);

  return <ServicesContext.Provider value={services}>{children}</ServicesContext.Provider>;
}

export function useServices(): AppServices {
  const services = useContext(ServicesContext);
  if (!services) {
    throw new Error('useServices must be used within a ServicesProvider.');
  }
  return services;
}

import { createContext, useContext, useState, type PropsWithChildren } from 'react';

import { createAppServices, type AppServices } from './container';

const ServicesContext = createContext<AppServices | null>(null);

export function ServicesProvider({ children }: PropsWithChildren) {
  // Initialisation paresseuse : le conteneur n'est créé qu'une fois par montage.
  const [services] = useState(createAppServices);

  return <ServicesContext.Provider value={services}>{children}</ServicesContext.Provider>;
}

export function useServices(): AppServices {
  const services = useContext(ServicesContext);
  if (!services) {
    throw new Error('useServices doit être utilisé dans un ServicesProvider.');
  }
  return services;
}

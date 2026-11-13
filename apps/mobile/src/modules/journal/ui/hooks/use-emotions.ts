import { useEffect, useState } from 'react';

import { useServices } from '@/di/services-provider';
import type { EmotionCatalogState } from '@/modules/journal/ui/format/emotion';

/** The emotion catalog, loaded once when the screen mounts. */
export function useEmotions(): EmotionCatalogState {
  const services = useServices();
  const [catalog, setCatalog] = useState<EmotionCatalogState>({ status: 'loading' });

  useEffect(() => {
    let isCurrent = true;
    services.listEmotions
      .execute()
      .then((emotions) => isCurrent && setCatalog({ status: 'ready', emotions }))
      .catch(() => isCurrent && setCatalog({ status: 'failed' }));
    return () => {
      isCurrent = false;
    };
  }, [services]);

  return catalog;
}

import { ScrollViewStyleReset } from 'expo-router/html';
import type { PropsWithChildren } from 'react';

import { colors } from '@/shared/ui/theme';

/**
 * Root HTML document of the static web export (ADR-0010). Runs only in
 * Node at export time: no browser API here.
 */
export default function Root({ children }: PropsWithChildren) {
  return (
    <html lang="fr">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, shrink-to-fit=no, viewport-fit=cover"
        />
        <meta
          name="description"
          content="Journal de bord familial pour renforcer la confiance en soi des enfants."
        />
        <meta name="theme-color" content={colors.inkSoft} />

        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" />
        <meta name="apple-mobile-web-app-title" content="Pousse" />

        <ScrollViewStyleReset />
      </head>
      <body>{children}</body>
    </html>
  );
}

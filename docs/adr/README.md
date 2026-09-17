# Décisions d'architecture (ADR)

Ce dossier contient les Architecture Decision Records du projet **Pousse**.

## Convention

Format Nygard, quatre sections : **Statut**, **Contexte**, **Décision**, **Conséquences**.
La section Conséquences inclut explicitement ce que la décision coûte. Un ADR qui ne
mentionne que des bénéfices est une justification après coup, pas une décision documentée.

Les fichiers sont numérotés dans l'ordre de rédaction et ne sont jamais renumérotés.

**Un ADR ne se modifie pas, il se remplace.** Quand une décision évolue :

- un nouvel ADR est rédigé au statut `Accepté`, indiquant l'ADR qu'il remplace ;
- l'ADR d'origine passe au statut `Remplacé par ADR-XXXX` et reste dans le dépôt.

L'historique des décisions fait partie de la documentation technique au même titre
que le code.

## Index

| N°                                             | Titre                                             | Statut                                                 |
| ---------------------------------------------- | ------------------------------------------------- | ------------------------------------------------------ |
| [0001](0001-framework-http.md)                 | Framework HTTP : Fastify                          | Accepté                                                |
| [0002](0002-acces-donnees.md)                  | Accès aux données : Drizzle ORM                   | Accepté                                                |
| [0003](0003-authentification-par-session.md)   | Authentification par session persistée            | Accepté                                                |
| [0004](0004-stockage-local-des-photos.md)      | Stockage des photos sur l'appareil                | Accepté                                                |
| [0005](0005-contraintes-dans-le-schema-orm.md) | Les contraintes vivent dans le schéma de l'ORM    | Accepté                                                |
| [0006](0006-decoupage-modulaire.md)            | Découpage modulaire par domaine métier            | Accepté                                                |
| [0007](0007-strategie-de-tests.md)             | Stratégie de tests                                | Accepté                                                |
| [0008](0008-choix-expo-client-mobile.md)       | Choix d'Expo (React Native) pour le client mobile | Remplacé par [0010](0010-pwa-d-abord-natif-ensuite.md) |
| [0009](0009-organisation-monorepo.md)          | Organisation en monorepo (apps/mobile, apps/api)  | Accepté                                                |
| [0010](0010-pwa-d-abord-natif-ensuite.md)      | Livraison en PWA d'abord, natif ensuite           | Accepté                                                |
| [0011](0011-hebergement-et-deploiement.md)     | Hébergement et déploiement                        | Accepté                                                |

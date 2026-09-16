# ADR-0010 — Livraison en PWA d'abord, natif ensuite

- **Statut** : Accepté — remplace [ADR-0008](0008-choix-expo-client-mobile.md)
- **Date** : 2026-09-16

## Contexte

L'ADR-0008 a retenu Expo en workflow managé, avec EAS pour le build et la
distribution sur les stores, et a écarté la PWA faute de notifications
fiables, de stockage sécurisé hors navigateur et d'une expérience correcte
sur iOS.

Avant le premier déploiement, un audit (septembre 2026) a réévalué ce choix
sous deux contraintes : un budget minimal et le besoin de livrer rapidement
une application installable à montrer.

**La distribution native a un coût fixe et des délais.** Programme
développeur Apple à 99 € par an, compte Google Play à 25 $, et, pour un
compte Google personnel, un test fermé obligatoire de 12 testeurs pendant
14 jours consécutifs avant toute mise en production. S'y ajoutent le quota
du plan gratuit d'EAS Build et les délais de validation des stores.

**Les capacités du web ont évolué depuis les arguments de l'ADR-0008.**
Pour chaque besoin de l'application :

- prise de photo et choix dans la galerie : `expo-image-picker` fonctionne
  sur le web ;
- stockage des photos sur l'appareil : l'Origin Private File System est
  disponible sur Chrome et sur Safari. Depuis Safari 17, les quotas sont
  larges, et la purge après 7 jours sans visite ne s'applique pas aux
  applications ajoutées à l'écran d'accueil ;
- session : un cookie `httpOnly` géré par le navigateur remplace le trousseau
  sans être lisible par le JavaScript ;
- notifications : Web Push existe sur iOS depuis la version 16.4, pour les
  applications ajoutées à l'écran d'accueil.

**Un besoin reste sans équivalent.** Aucun navigateur ne permet de
programmer une notification locale : l'API Notification Triggers n'a jamais
dépassé le stade expérimental. Le rappel du soir, réglé par enfant (20:00
par défaut), exigerait donc un envoi depuis le serveur.

**Le client est écrit en React Native Web.** Les mêmes écrans produisent
l'export web (`npx expo export -p web`) et les binaires natifs (EAS Build).
Choisir la PWA ne supprime pas la cible native : cela change l'ordre de
livraison.

## Décision

**Le premier canal de livraison est une PWA issue de l'export web statique
d'Expo. Le natif reste une cible, reportée et non abandonnée.**

### Ce qui est conservé de l'ADR-0008

Expo (workflow managé) et `expo-router` restent le socle du client. Les
justifications de l'ADR-0008 sur ce point restent valables : un seul code
pour toutes les plateformes, pas de configuration native à maintenir, routes
typées. Seuls le build et la distribution via EAS sont reportés.

### La PWA

- Le manifeste `apps/mobile/public/manifest.json` déclare l'application :
  affichage `standalone`, orientation portrait, couleurs du thème « Cocon »,
  icônes standard et « maskable ». Il est lié depuis
  `apps/mobile/src/app/+html.tsx`, le point d'extension documenté par Expo
  pour le document HTML de l'export statique, qui porte aussi l'icône
  iOS (`apple-touch-icon`).
- Cibles supportées : Chrome (Android et ordinateur) et Safari iOS **en mode
  installé** sur l'écran d'accueil. L'usage dans un simple onglet Safari
  n'est pas garanti.
- Le service worker (cache hors connexion, stratégie de mise à jour) fait
  l'objet d'une étape ultérieure. Expo met en garde contre un cache agressif
  qui fige une version chez l'utilisateur ; il ne sera ajouté qu'avec une
  stratégie de mise à jour explicite.

### Une capacité de plateforme, un port, deux adaptateurs

Pour que le natif reste à un build près, **aucune API propre au web ou au
natif n'est appelée hors d'un adaptateur d'infrastructure**. Chaque capacité
de plateforme est un port du domaine, avec un adaptateur web et un
adaptateur natif, sélectionnés à la composition (`src/di`).

- **Session** : le cookie de session est `HttpOnly`, `Secure`,
  `SameSite=Lax`, et entièrement géré par le navigateur. Les appels vers les
  routes métier partent avec `credentials: "include"`. Le web et l'API sont
  servis sous le même domaine (sous-domaines distincts). L'API autorise
  explicitement l'origine web, à la fois dans CORS et dans les
  `trustedOrigins` de BetterAuth. Le jeton de session n'est jamais écrit
  dans `localStorage`. La décision de l'ADR-0003 (session persistée côté
  serveur, révocable immédiatement) est inchangée ; seul le stockage côté
  client diffère.
- **Photos** : l'adaptateur web écrit dans l'Origin Private File System et
  demande la persistance (`navigator.storage.persist()`). La base conserve
  le nom de fichier seul. La décision de l'ADR-0004 est inchangée : les
  photos ne quittent pas l'appareil, et sur le web l'appareil est le
  navigateur.

### Le rappel du soir

**La notification du rappel du soir est hors du périmètre de la première
livraison.** Le réglage reste enregistré par enfant, mais aucune
notification n'est envoyée. Deux voies restent ouvertes, à trancher dans un
ADR dédié :

- **Web Push** : clés VAPID, abonnements enregistrés en base, planificateur
  côté serveur qui envoie à chaque foyer à son heure locale ;
- **build natif** : planification locale avec `expo-notifications`, sans
  code serveur.

### Alternatives écartées

**Natif d'abord (statu quo de l'ADR-0008)** — frais de stores et délais de
validation engagés avant que le produit ait été éprouvé auprès de vrais
utilisateurs.

**PWA seule, natif abandonné** — renoncer définitivement au rappel local
et à la présence sur les stores, sans rien économiser de plus : le code
produit déjà les deux cibles.

**Emballer l'export web dans Capacitor** — ajoute une seconde chaîne native
à maintenir, alors qu'Expo produit déjà le natif à partir du même code.

## Conséquences

- **Le rituel perd son déclencheur à la première livraison.** Sans rappel
  du soir, c'est au parent de penser au rituel. C'est le coût produit
  principal de cette décision.
- **Sur iOS, l'installation est manuelle** (Partager → Sur l'écran
  d'accueil) et doit être expliquée dans l'application. Sans installation,
  pas de notifications possibles, et le stockage est purgé après 7 jours
  sans visite.
- **Les photos restent plus fragiles que sur mobile natif.** Elles
  disparaissent si l'utilisateur efface les données du site, et peuvent être
  supprimées par le navigateur quand le disque est saturé si la persistance
  a été refusée. Une photo prise dans la PWA est absente d'une future
  installation native, et inversement : l'indication « fichier absent » de
  l'ADR-0004 couvre ce cas.
- **Aucune présence sur les stores** : ni recherche, ni fiche, ni avis.
- **Un nom de domaine est requis** : sans domaine commun au web et à l'API,
  le cookie de session devient un cookie tiers, bloqué par Safari et
  Firefox.
- **Une discipline de plus** : toute nouvelle capacité de plateforme passe
  par un port et deux adaptateurs, et se vérifie sur les deux cibles.
- **Seule la PWA porte pour l'instant le logo de Pousse** (icônes du
  manifeste, icône iOS de l'écran d'accueil, favicon). Les icônes natives
  (`assets/expo.icon` pour iOS, calques d'icône adaptative Android) sont
  encore celles du modèle Expo et devront être refaites avant toute
  publication native.
- **Le natif garde un coût d'entrée différé** : configuration `eas.json`,
  identifiants d'application définitifs, comptes développeur, et, pour
  Android, les 14 jours de test fermé à anticiper.
- Les frais de stores (99 € par an et 25 $) ne sont engagés qu'au moment de
  la publication native.
- L'ADR-0008 passe au statut « Remplacé par ADR-0010 ». Les ADR-0003 et
  ADR-0004 restent en vigueur.

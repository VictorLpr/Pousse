# ADR-0004 — Stockage des photos sur l'appareil

- **Statut** : Accepté
- **Date** : 2026-09-14

## Contexte

Une entrée de journal peut être illustrée par une photo. Ces photos représentent des
enfants de quatre à douze ans. Ce sont, de loin, les données les plus sensibles que
l'application manipule.

L'architecture ne prévoit pas de service de stockage objet.

## Décision

**Les photos ne quittent pas l'appareil.** Elles sont écrites dans le répertoire de
documents de l'application via `expo-file-system` et ne sont jamais transmises au
serveur.

La base conserve une ligne `PHOTO` portant **le nom de fichier seul** — jamais un
chemin absolu — ainsi que le type MIME.

### Justification

**Minimisation appliquée à la donnée la plus sensible.** Aucune photo d'enfant n'est
transmise, stockée ou traitée par le serveur. Il n'y a par conséquent ni chiffrement au
repos à mettre en œuvre, ni sauvegarde à sécuriser, ni effacement côté serveur à
garantir, ni fuite possible depuis l'infrastructure. C'est l'application directe du
principe de minimisation des données de l'article 5.1.c du RGPD.

**La ligne en base est conservée malgré l'absence de fichier côté serveur.** Elle
permet à l'application de savoir qu'une photo a existé pour une entrée donnée, et donc
d'afficher une indication explicite lorsque le fichier est absent de l'appareil courant
plutôt qu'un silence. Elle préserve également la contrainte `UNIQUE (entree_id)` du
modèle, et permettrait une bascule ultérieure vers un stockage distant sans modification
du schéma.

**Le nom de fichier est stocké seul, jamais le chemin complet.** Sur iOS, le chemin du
conteneur applicatif contient un identifiant qui change entre installations, mises à
jour et passage d'une distribution de test à une distribution publique. Apple indique
explicitement que ce chemin peut changer, qu'il n'existe aucun moyen de l'empêcher, et
qu'une application doit stocker un chemin relatif. Conserver une URI absolue rendrait
l'intégralité des photos inaccessibles à la première mise à jour. Le chemin est donc
reconstruit à l'exécution à partir du répertoire de documents et du nom de fichier.

## Conséquences

- **Les photos sont perdues en cas de changement d'appareil, de désinstallation ou de
  réinstallation.** Pour une application dont la promesse est de conserver des
  souvenirs sur plusieurs années, c'est une limite de nature produit et non seulement
  technique. Elle est assumée pour le périmètre du MVP.
- L'interface informe l'utilisateur, au moment du premier ajout de photo, que
  celles-ci restent sur l'appareil et ne sont pas sauvegardées.
- Le répertoire de documents est utilisé, à l'exclusion du répertoire de cache, que le
  système peut purger à tout moment.
- Le texte de l'entrée de journal, lui, est bien synchronisé. En cas de changement
  d'appareil, le souvenir écrit subsiste sans son illustration. Cette asymétrie est
  volontaire : le texte est peu volumineux et peu identifiant, l'image ne l'est pas.
- L'attribut est nommé `nom_fichier`. Le terme « clé de stockage » désignerait un objet
  distant et ne décrirait pas ce qui est stocké.

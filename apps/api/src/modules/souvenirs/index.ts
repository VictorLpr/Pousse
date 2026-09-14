import type { FastifyInstance } from 'fastify';

/**
 * Module souvenirs : consultation de la galerie de souvenirs. Les photos
 * elles-mêmes ne transitent jamais par le serveur (ADR-0004) ; ce module ne
 * sert que les métadonnées (texte, émotion, présence d'une photo).
 *
 * À implémenter : route de consultation, consommée par la galerie mobile.
 */
export async function souvenirsModule(_app: FastifyInstance): Promise<void> {
  // Routes à venir.
}

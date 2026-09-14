/**
 * Types d'erreurs communs à tous les modules. Aucune logique métier ici
 * (ADR-0006) : uniquement des classes d'erreur génériques réutilisables par
 * n'importe quel module.
 */
export class NotFoundError extends Error {
  constructor(resource: string, id: string) {
    super(`${resource} introuvable : ${id}`);
    this.name = 'NotFoundError';
  }
}

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

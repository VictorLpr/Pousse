/** The picture types the API accepts for an entry's photo. */
export const PHOTO_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const;

export type PhotoMimeType = (typeof PHOTO_MIME_TYPES)[number];

/**
 * An entry's photo as the API knows it (ADR-0004): the picture never leaves
 * the device, only its file name — never a path — and its type are stored.
 * The path is rebuilt from the app's documents directory when it is shown.
 */
export interface EntryPhoto {
  readonly fileName: string;
  readonly mimeType: PhotoMimeType;
}

/** A photo on this device, as the ritual draft holds it until the entry is kept. */
export interface LocalPhoto {
  readonly uri: string;
  readonly mimeType: PhotoMimeType;
}

/** What the API is told about a device photo: the last segment of its URI and its type. */
export function entryPhotoOf(photo: LocalPhoto): EntryPhoto {
  const fileName = photo.uri.split(/[/\\]/).pop() ?? '';
  return { fileName, mimeType: photo.mimeType };
}

import type { LocalPhoto } from '@/modules/journal/domain/entities/photo';
import type { PhotoPicker } from '@/modules/journal/domain/ports/photo-picker';

/** The one stand-in for a device photo, until the camera and photo library are wired. */
export const PLACEHOLDER_PHOTO: LocalPhoto = {
  uri: 'memory://photo-placeholder',
  mimeType: 'image/jpeg',
};

/** Hands back the same symbolic photo for every pick. */
export class PlaceholderPhotoPicker implements PhotoPicker {
  async pick(): Promise<LocalPhoto> {
    return PLACEHOLDER_PHOTO;
  }
}

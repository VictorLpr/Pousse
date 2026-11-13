import type { LocalPhoto } from '@/modules/journal/domain/entities/photo';
import type { PhotoPicker } from '@/modules/journal/domain/ports/photo-picker';

/** The evening's photo for the ritual draft; it stays on the device. */
export class PickRitualPhoto {
  constructor(private readonly picker: PhotoPicker) {}

  execute(): Promise<LocalPhoto> {
    return this.picker.pick();
  }
}

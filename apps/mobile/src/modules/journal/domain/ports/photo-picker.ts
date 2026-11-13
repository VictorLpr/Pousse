import type { LocalPhoto } from '../entities/photo';

export interface PhotoPicker {
  /** A photo of the evening, kept on this device (ADR-0004). */
  pick(): Promise<LocalPhoto>;
}

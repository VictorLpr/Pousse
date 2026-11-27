import type {
  JournalEntry,
  NewJournalEntry,
} from '@/modules/journal/domain/entities/journal-entry';
import type { EntryPhoto } from '@/modules/journal/domain/entities/photo';

/** A journal entry as `/journal/entries` returns it: `createdAt` is an ISO string. */
export interface JournalEntryDto {
  readonly id: string;
  readonly childId: string;
  readonly emotionCode: string;
  readonly text: string;
  readonly date: string;
  readonly createdAt: string;
  readonly photo: EntryPhoto | null;
}

/** The `POST /journal/entries` body: the API wants `photo` left out, not `null`. */
export interface CreateJournalEntryBody {
  readonly childId: string;
  readonly emotionCode: string;
  readonly text: string;
  readonly date: string;
  readonly photo?: EntryPhoto;
}

export function journalEntryFromDto(dto: JournalEntryDto): JournalEntry {
  return {
    id: dto.id,
    childId: dto.childId,
    emotionCode: dto.emotionCode,
    text: dto.text,
    date: dto.date,
    createdAt: new Date(dto.createdAt),
    photo: dto.photo,
  };
}

/** Only the photo's file name and type are sent: the picture stays on the device (ADR-0004). */
export function createJournalEntryBodyOf(entry: NewJournalEntry): CreateJournalEntryBody {
  const body: CreateJournalEntryBody = {
    childId: entry.childId,
    emotionCode: entry.emotionCode,
    text: entry.text,
    date: entry.date,
  };
  return entry.photo
    ? { ...body, photo: { fileName: entry.photo.fileName, mimeType: entry.photo.mimeType } }
    : body;
}

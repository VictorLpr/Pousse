import type {
  CreatedJournalEntry,
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

/** A badge in the API's `awardedBadges`: `awardedAt` is an ISO string. */
export interface AwardedBadgeDto {
  readonly code: string;
  readonly label: string;
  readonly description: string | null;
  readonly awardedAt: string;
}

/** The `POST /journal/entries` response: the entry and the badges it earned. */
export interface CreatedJournalEntryDto extends JournalEntryDto {
  readonly awardedBadges: readonly AwardedBadgeDto[];
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

export function createdJournalEntryFromDto(dto: CreatedJournalEntryDto): CreatedJournalEntry {
  return {
    ...journalEntryFromDto(dto),
    awardedBadges: dto.awardedBadges.map((badge) => ({
      code: badge.code,
      label: badge.label,
      description: badge.description,
      awardedAt: new Date(badge.awardedAt),
    })),
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

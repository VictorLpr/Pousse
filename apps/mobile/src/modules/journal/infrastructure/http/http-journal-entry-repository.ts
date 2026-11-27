import type {
  CreatedJournalEntry,
  JournalEntry,
  NewJournalEntry,
} from '@/modules/journal/domain/entities/journal-entry';
import type { JournalEntryRepository } from '@/modules/journal/domain/ports/journal-entry-repository';
import { journalErrorOf } from '@/modules/journal/infrastructure/http/journal-api-error';
import {
  createdJournalEntryFromDto,
  createJournalEntryBodyOf,
  journalEntryFromDto,
  type CreatedJournalEntryDto,
  type JournalEntryDto,
} from '@/modules/journal/infrastructure/http/journal-entry-dto';
import type { HttpClient } from '@/shared/infrastructure/http/http-client';

interface StreakDto {
  readonly streak: number;
}

/** The journal on the API (`/journal/entries`, `/journal/streak`), for the signed-in parent. */
export class HttpJournalEntryRepository implements JournalEntryRepository {
  constructor(private readonly http: HttpClient) {}

  async findByChildId(childId: string): Promise<JournalEntry[]> {
    const query = new URLSearchParams({ childId });
    try {
      const entries = await this.http.get<JournalEntryDto[]>(`/journal/entries?${query}`);
      return entries.map(journalEntryFromDto);
    } catch (error) {
      throw journalErrorOf(error);
    }
  }

  async create(entry: NewJournalEntry): Promise<CreatedJournalEntry> {
    try {
      const created = await this.http.post<CreatedJournalEntryDto>(
        '/journal/entries',
        createJournalEntryBodyOf(entry),
      );
      return createdJournalEntryFromDto(created);
    } catch (error) {
      throw journalErrorOf(error);
    }
  }

  async countEveningStreak(childId: string, today: string): Promise<number> {
    const query = new URLSearchParams({ childId, today });
    try {
      const { streak } = await this.http.get<StreakDto>(`/journal/streak?${query}`);
      return streak;
    } catch (error) {
      throw journalErrorOf(error);
    }
  }
}

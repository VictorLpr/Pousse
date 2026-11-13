import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type PropsWithChildren,
} from 'react';

import type { EmotionCode } from '@/modules/journal/domain/entities/emotion';
import { localDayOf } from '@/modules/journal/domain/entities/journal-entry';
import type { LocalPhoto } from '@/modules/journal/domain/entities/photo';

/** Evening ritual draft, built step by step and kept only at the recap. */
interface RitualDraft {
  /**
   * The family's local day when the ritual began: a ritual finished after
   * midnight still belongs to the evening it started on.
   */
  readonly date: string;
  readonly emotionCode: EmotionCode | null;
  readonly text: string;
  /** The photo on this device; only its file name and type reach the journal. */
  readonly photo: LocalPhoto | null;
}

interface RitualDraftContextValue extends RitualDraft {
  setEmotion(emotionCode: EmotionCode): void;
  setText(text: string): void;
  setPhoto(photo: LocalPhoto | null): void;
  /** Starts a new ritual, dated today. */
  resetDraft(): void;
}

function newDraft(): RitualDraft {
  return { date: localDayOf(new Date()), emotionCode: null, text: '', photo: null };
}

const RitualDraftContext = createContext<RitualDraftContextValue | null>(null);

export function RitualDraftProvider({ children }: PropsWithChildren) {
  const [draft, setDraft] = useState<RitualDraft>(newDraft);

  const setEmotion = useCallback((emotionCode: EmotionCode) => {
    setDraft((current) => ({ ...current, emotionCode }));
  }, []);

  const setText = useCallback((text: string) => {
    setDraft((current) => ({ ...current, text }));
  }, []);

  const setPhoto = useCallback((photo: LocalPhoto | null) => {
    setDraft((current) => ({ ...current, photo }));
  }, []);

  const resetDraft = useCallback(() => {
    setDraft(newDraft());
  }, []);

  const value = useMemo(
    () => ({ ...draft, setEmotion, setText, setPhoto, resetDraft }),
    [draft, setEmotion, setText, setPhoto, resetDraft],
  );

  return <RitualDraftContext.Provider value={value}>{children}</RitualDraftContext.Provider>;
}

export function useRitualDraft(): RitualDraftContextValue {
  const context = useContext(RitualDraftContext);
  if (!context) {
    throw new Error('useRitualDraft must be used within a RitualDraftProvider.');
  }
  return context;
}

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type PropsWithChildren,
} from 'react';

import type { EmotionId } from '@/modules/journal/domain/entities/emotion';

/** Brouillon du rituel du soir, construit étape par étape. */
interface RitualDraft {
  readonly emotionId: EmotionId | null;
  readonly prideText: string;
  readonly photoUri: string | null;
}

interface RitualDraftContextValue extends RitualDraft {
  setEmotion(emotionId: EmotionId): void;
  setPrideText(text: string): void;
  setPhotoUri(uri: string | null): void;
  resetDraft(): void;
}

const EMPTY_DRAFT: RitualDraft = { emotionId: null, prideText: '', photoUri: null };

const RitualDraftContext = createContext<RitualDraftContextValue | null>(null);

export function RitualDraftProvider({ children }: PropsWithChildren) {
  const [draft, setDraft] = useState<RitualDraft>(EMPTY_DRAFT);

  const setEmotion = useCallback((emotionId: EmotionId) => {
    setDraft((current) => ({ ...current, emotionId }));
  }, []);

  const setPrideText = useCallback((prideText: string) => {
    setDraft((current) => ({ ...current, prideText }));
  }, []);

  const setPhotoUri = useCallback((photoUri: string | null) => {
    setDraft((current) => ({ ...current, photoUri }));
  }, []);

  const resetDraft = useCallback(() => {
    setDraft(EMPTY_DRAFT);
  }, []);

  const value = useMemo(
    () => ({ ...draft, setEmotion, setPrideText, setPhotoUri, resetDraft }),
    [draft, setEmotion, setPrideText, setPhotoUri, resetDraft],
  );

  return <RitualDraftContext.Provider value={value}>{children}</RitualDraftContext.Provider>;
}

export function useRitualDraft(): RitualDraftContextValue {
  const context = useContext(RitualDraftContext);
  if (!context) {
    throw new Error('useRitualDraft doit être utilisé dans un RitualDraftProvider.');
  }
  return context;
}

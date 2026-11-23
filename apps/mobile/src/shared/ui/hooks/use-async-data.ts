import { useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';

export type AsyncData<T> =
  | { readonly status: 'loading' }
  | { readonly status: 'ready'; readonly data: T }
  | { readonly status: 'failed' };

export interface AsyncDataHandle<T> {
  readonly state: AsyncData<T>;
  /** Loads again, showing the loading state until it settles. */
  retry(): void;
  /** Replaces the loaded data, e.g. with what a mutation returned. */
  update(next: (current: T) => T): void;
}

interface Settled<T> {
  readonly key: string;
  readonly state: AsyncData<T>;
}

const LOADING = { status: 'loading' } as const;

/**
 * Loads the data a screen shows for `key` (a child id, a parent id), again
 * each time the screen gains focus. A result that arrives after the screen
 * unmounted or moved to another key is dropped, so one child's data never
 * shows on another's screen. A reload for the same key keeps the data on
 * screen until it settles. `null` loads nothing.
 */
export function useAsyncData<T>(
  key: string | null,
  load: (key: string) => Promise<T>,
): AsyncDataHandle<T> {
  const [settled, setSettled] = useState<Settled<T> | null>(null);
  const loadRef = useRef(load);
  // Only the latest request settles; unmounting or leaving a key bumps it too.
  const latestRequest = useRef(0);

  // Declared before the focus effect, so a load always runs the latest closure.
  useEffect(() => {
    loadRef.current = load;
  });

  const run = useCallback((requestKey: string) => {
    const request = ++latestRequest.current;
    const settle = (state: AsyncData<T>) => {
      if (request === latestRequest.current) {
        setSettled({ key: requestKey, state });
      }
    };
    loadRef
      .current(requestKey)
      .then((data) => settle({ status: 'ready', data }))
      .catch(() => settle({ status: 'failed' }));
  }, []);

  useFocusEffect(
    useCallback(() => {
      if (key === null) {
        return;
      }
      run(key);
      return () => {
        latestRequest.current += 1;
      };
    }, [key, run]),
  );

  const retry = useCallback(() => {
    if (key !== null) {
      setSettled(null);
      run(key);
    }
  }, [key, run]);

  const update = useCallback((next: (current: T) => T) => {
    setSettled((current) =>
      current?.state.status === 'ready'
        ? { key: current.key, state: { status: 'ready', data: next(current.state.data) } }
        : current,
    );
  }, []);

  const state = key !== null && settled?.key === key ? settled.state : LOADING;
  return { state, retry, update };
}

import { useState, useCallback } from 'react';

export interface UseRepCounterReturn {
  repsByRound: number[];
  currentRound: number;
  totalReps: number;
  addRep: () => void;
  removeRep: () => void;
  nextRound: () => void;
  reset: () => void;
}

export function useRepCounter(): UseRepCounterReturn {
  const [repsByRound, setRepsByRound] = useState<number[]>([0]);

  const addRep = useCallback(() => {
    setRepsByRound((prev) => {
      const next = [...prev];
      next[next.length - 1]++;
      return next;
    });
  }, []);

  const removeRep = useCallback(() => {
    setRepsByRound((prev) => {
      const next = [...prev];
      if (next[next.length - 1] > 0) next[next.length - 1]--;
      return next;
    });
  }, []);

  const nextRound = useCallback(() => {
    setRepsByRound((prev) => [...prev, 0]);
  }, []);

  const reset = useCallback(() => {
    setRepsByRound([0]);
  }, []);

  const totalReps = repsByRound.reduce((sum, r) => sum + r, 0);

  return {
    repsByRound,
    currentRound: repsByRound.length,
    totalReps,
    addRep,
    removeRep,
    nextRound,
    reset,
  };
}

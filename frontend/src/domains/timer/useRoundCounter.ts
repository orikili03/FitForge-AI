import { useState, useCallback } from "react";

export interface UseRoundCounterReturn {
    /** Rounds completed (tap +1 to increment) */
    rounds: number;
    addRound: () => void;
    /** Undo last round (min 0) */
    subtractRound: () => void;
    reset: () => void;
}

export function useRoundCounter(): UseRoundCounterReturn {
    const [rounds, setRounds] = useState(0);

    const addRound = useCallback(() => {
        setRounds((prev) => prev + 1);
    }, []);

    const subtractRound = useCallback(() => {
        setRounds((prev) => Math.max(0, prev - 1));
    }, []);

    const reset = useCallback(() => {
        setRounds(0);
    }, []);

    return { rounds, addRound, subtractRound, reset };
}

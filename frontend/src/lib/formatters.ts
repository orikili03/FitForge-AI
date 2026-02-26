export function formatProtocol(protocol: string): string {
    const p = protocol.toUpperCase().replace(/-/g, "_");

    const mapping: Record<string, string> = {
        AMRAP: "AMRAP",
        EMOM: "EMOM",
        FOR_TIME: "For Time",
        TABATA: "Tabata",
        DEATH_BY: "Death By",
        "21_15_9": "21-15-9",
        LADDER: "Ladder",
        CHIPPER: "Chipper",
        INTERVAL: "Intervals",
        STRENGTH_SINGLE: "Max Strength",
        STRENGTH_SETS: "Strength Sets",
        REST_DAY: "Rest Day",
    };

    return mapping[p] ?? protocol;
}

import { useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Search, Eye, X, Trash2 } from "lucide-react";
import { useWorkoutHistory, useClearWorkoutHistory } from "../domains/workouts/hooks";
import { expandForDisplay } from "../lib/abbreviations";
import { WodBlock } from "../components/wod/WodBlock";
import type { WorkoutResponse } from "../domains/workouts/api";

function formatCompletionTime(seconds: number): string {
    const m = Math.floor(seconds / 60);
    const s = Math.round(seconds % 60);
    return s < 10 ? `${m}:0${s}` : `${m}:${s}`;
}

function filterHistory(
    list: WorkoutResponse[],
    searchQuery: string,
    filterType: string,
    filterDuration: string
): WorkoutResponse[] {
    let out = list;

    const q = searchQuery.trim().toLowerCase();
    if (q) {
        out = out.filter((w) => {
            const type = (w.wod?.type ?? w.type ?? "").toLowerCase();
            const desc = (w.wod?.description ?? "").toLowerCase();
            const movements = (w.wod?.movements ?? []).join(" ").toLowerCase();
            const warmup = (w.warmup ?? []).join(" ").toLowerCase();
            const scaling = (w.scalingOptions ?? []).join(" ").toLowerCase();
            const dateStr = new Date(w.date).toLocaleString().toLowerCase();
            const searchable = [type, desc, movements, warmup, scaling, dateStr].join(" ");
            return searchable.includes(q);
        });
    }

    if (filterType) {
        out = out.filter((w) => (w.wod?.type ?? w.type) === filterType);
    }

    if (filterDuration) {
        out = out.filter((w) => {
            const d = w.durationMinutes ?? w.wod?.duration ?? 0;
            if (filterDuration === "short") return d <= 12;
            if (filterDuration === "medium") return d >= 13 && d <= 22;
            if (filterDuration === "long") return d >= 23;
            return true;
        });
    }

    return out;
}

export function HistoryPage() {
    const queryClient = useQueryClient();
    const { data, isLoading } = useWorkoutHistory();
    const clearHistoryMutation = useClearWorkoutHistory();
    const [searchQuery, setSearchQuery] = useState("");
    const [filterType, setFilterType] = useState("");
    const [filterDuration, setFilterDuration] = useState("");
    const [viewWorkout, setViewWorkout] = useState<WorkoutResponse | null>(null);

    const handleClearHistory = () => {
        if (!window.confirm("Delete all workout history? This cannot be undone.")) return;
        clearHistoryMutation.mutate(undefined, {
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: ["workouts", "history"] });
                setViewWorkout(null);
            },
        });
    };

    const filtered = useMemo(() => {
        if (!data) return [];
        return filterHistory(data, searchQuery, filterType, filterDuration);
    }, [data, searchQuery, filterType, filterDuration]);

    const wodTypes = useMemo(() => {
        if (!data) return [];
        const set = new Set<string>();
        data.forEach((w) => {
            const t = w.wod?.type ?? w.type;
            if (t) set.add(t);
        });
        return Array.from(set).sort();
    }, [data]);

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-semibold text-ds-text">History</h1>
                <p className="text-sm text-ds-text-muted mt-1">
                    {data && data.length > 0
                        ? "Search and filter past workouts. Click the eye to view details."
                        : "Your past workouts will appear here."}
                </p>
            </div>

            {data && data.length > 0 && (
                <div className="rounded-ds-xl border border-ds-border bg-ds-surface p-ds-3 shadow-ds-sm space-y-3">
                    <div className="relative">
                        <Search
                            className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ds-text-muted"
                            aria-hidden
                        />
                        <input
                            type="search"
                            placeholder="Search by type, movements, date, description…"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full rounded-ds-md border border-ds-border bg-ds-bg py-2.5 pl-4 pr-10 text-ds-body-sm text-ds-text placeholder:text-ds-text-muted focus:border-ds-border-strong focus:outline-none focus:ring-1 focus:ring-ds-border-strong"
                            aria-label="Search workouts"
                        />
                    </div>
                    <div className="flex flex-nowrap items-stretch gap-2">
                        <select
                            value={filterType}
                            onChange={(e) => setFilterType(e.target.value)}
                            className="min-w-0 flex-1 rounded-ds-md border border-ds-border bg-ds-bg px-3 py-2 text-ds-body-sm text-ds-text focus:border-ds-border-strong focus:outline-none"
                            aria-label="Filter by WOD type"
                        >
                            <option value="">All types</option>
                            {wodTypes.map((t) => (
                                <option key={t} value={t}>{t}</option>
                            ))}
                        </select>
                        <select
                            value={filterDuration}
                            onChange={(e) => setFilterDuration(e.target.value)}
                            className="min-w-0 flex-1 rounded-ds-md border border-ds-border bg-ds-bg px-3 py-2 text-ds-body-sm text-ds-text focus:border-ds-border-strong focus:outline-none"
                            aria-label="Filter by duration"
                        >
                            <option value="">Any duration</option>
                            <option value="short">Short (≤12 min)</option>
                            <option value="medium">Medium (13–22 min)</option>
                            <option value="long">Long (23+ min)</option>
                        </select>
                        {(searchQuery || filterType || filterDuration) && (
                            <button
                                type="button"
                                onClick={() => {
                                    setSearchQuery("");
                                    setFilterType("");
                                    setFilterDuration("");
                                }}
                                className="min-w-0 flex-1 flex items-center justify-center gap-1.5 rounded-ds-md px-3 py-2 text-ds-body-sm font-medium text-ds-text-muted transition-colors hover:bg-ds-surface-hover hover:text-red-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ds-border focus-visible:ring-offset-2 focus-visible:ring-offset-ds-bg"
                            >
                                Clear filters
                            </button>
                        )}
                    </div>
                    {(searchQuery || filterType || filterDuration) && (
                        <p className="mt-2 text-ds-caption text-ds-text-muted">
                            Showing {filtered.length} of {data.length} workouts
                        </p>
                    )}
                </div>
            )}

            <div className="card">
                {isLoading && <p className="text-sm text-ds-text-muted">Loading...</p>}
                {!isLoading && (!data || data.length === 0) && (
                    <p className="text-sm text-ds-text-muted">No workout history available.</p>
                )}
                {!isLoading && data && data.length > 0 && filtered.length === 0 && (
                    <p className="text-sm text-ds-text-muted">No workouts match your search or filters.</p>
                )}
                {!isLoading && data && filtered.length > 0 && (
                    <ul className="divide-y divide-ds-border text-sm">
                        {filtered.map((w) => (
                            <li key={w.id} className="py-3 flex items-center justify-between gap-3">
                                <div>
                                    <div className="font-medium text-ds-text">
                                        {w.wod.type}
                                        {(w.wod.duration ?? w.durationMinutes) != null && (w.wod.duration ?? w.durationMinutes) > 0 && (
                                            <> • {(w.wod.duration ?? w.durationMinutes)} min</>
                                        )}
                                        {w.completed && (w.completionTime != null || (w.roundsOrReps != null && w.roundsOrReps > 0)) && (
                                            <span className="text-ds-text-muted font-normal">
                                                {" · "}
                                                {w.completionTime != null && formatCompletionTime(w.completionTime)}
                                                {w.completionTime != null && w.roundsOrReps != null && w.roundsOrReps > 0 && " · "}
                                                {w.roundsOrReps != null && w.roundsOrReps > 0 && `${w.roundsOrReps} rds`}
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-xs text-ds-text-muted">
                                        {new Date(w.date).toLocaleDateString()} • {w.wod.movements.map(expandForDisplay).join(" / ")}
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setViewWorkout(w)}
                                    className="p-2 rounded-lg text-ds-text-muted hover:text-amber-400 hover:bg-amber-400/10 transition-colors"
                                    title="View workout"
                                    aria-label="View workout details"
                                >
                                    <Eye className="h-5 w-5" />
                                </button>
                            </li>
                        ))}
                    </ul>
                )}

                {data && data.length > 0 && (
                    <div className="border-t border-ds-border pt-4 flex justify-end">
                        <button
                            type="button"
                            onClick={handleClearHistory}
                            disabled={clearHistoryMutation.isPending}
                            className="inline-flex items-center gap-1.5 rounded-ds-md border border-ds-border-strong bg-ds-surface px-3 py-2 text-ds-body-sm font-medium text-ds-text-muted transition-colors hover:bg-ds-surface-hover hover:text-red-400 hover:border-red-400/50 disabled:opacity-50 disabled:pointer-events-none"
                            aria-label="Delete all workout history"
                        >
                            <Trash2 className="h-4 w-4" />
                            Delete history
                        </button>
                    </div>
                )}

                {viewWorkout && (
                    <div
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
                        onClick={() => setViewWorkout(null)}
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="workout-detail-title"
                    >
                        <div
                            className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-ds-xl border border-ds-border bg-ds-surface p-5 shadow-ds-lg"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex items-start justify-between gap-3 mb-4">
                                <h2 id="workout-detail-title" className="text-lg font-semibold text-ds-text">
                                    {viewWorkout.wod.type}
                                    {(viewWorkout.wod.duration ?? viewWorkout.durationMinutes) != null && (viewWorkout.wod.duration ?? viewWorkout.durationMinutes) > 0 && (
                                        <> • {(viewWorkout.wod.duration ?? viewWorkout.durationMinutes)} min</>
                                    )}
                                </h2>
                                <button
                                    type="button"
                                    onClick={() => setViewWorkout(null)}
                                    className="p-1.5 rounded-lg text-ds-text-muted hover:text-ds-text hover:bg-ds-surface-hover transition-colors"
                                    aria-label="Close"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>
                            <div className="mb-4 text-sm text-ds-text-muted">
                                {new Date(viewWorkout.date).toLocaleDateString(undefined, {
                                    weekday: "short",
                                    year: "numeric",
                                    month: "short",
                                    day: "numeric",
                                })}{" "}
                                at {new Date(viewWorkout.date).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })}
                            </div>
                            {viewWorkout.equipmentPresetName && (
                                <p className="mb-4 text-ds-body-sm text-ds-text-muted">
                                    Rig: <span className="font-medium text-ds-text">{viewWorkout.equipmentPresetName}</span>
                                </p>
                            )}

                            <div className="mb-4">
                                <WodBlock
                                    type={viewWorkout.wod.type}
                                    durationMinutes={viewWorkout.wod.duration ?? viewWorkout.durationMinutes ?? 0}
                                    rounds={viewWorkout.wod.rounds}
                                    movementItems={viewWorkout.wod.movementItems}
                                    movements={viewWorkout.wod.movements}
                                />
                            </div>

                            {viewWorkout.completed && (viewWorkout.completionTime != null || (viewWorkout.roundsOrReps != null && viewWorkout.roundsOrReps > 0)) && (
                                <div className="rounded-ds-lg border border-ds-border bg-ds-surface-subtle p-4 space-y-2">
                                    <p className="text-xs uppercase tracking-wider text-ds-text-muted font-medium">Your result</p>
                                    <div className="flex flex-wrap gap-4 text-ds-text">
                                        {viewWorkout.completionTime != null && (
                                            <span><strong>Time</strong> {formatCompletionTime(viewWorkout.completionTime)}</span>
                                        )}
                                        {viewWorkout.roundsOrReps != null && viewWorkout.roundsOrReps > 0 && (
                                            <span><strong>Rounds</strong> {viewWorkout.roundsOrReps}</span>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}


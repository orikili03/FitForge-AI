import { useMemo, useState } from "react";
import { Search, Eye, X } from "lucide-react";
import { useWorkoutHistory } from "../features/workouts/workoutApi";
import type { WorkoutResponse } from "../features/workouts/workoutApi";

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
  const { data, isLoading } = useWorkoutHistory();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("");
  const [filterDuration, setFilterDuration] = useState("");
  const [viewWorkout, setViewWorkout] = useState<WorkoutResponse | null>(null);

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
          Search and filter past workouts. Click the eye to view details.
        </p>
      </div>

      <div className="rounded-ds-xl border border-ds-border bg-ds-surface p-ds-3 shadow-ds-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
          <div className="relative flex-1">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ds-text-muted"
              aria-hidden
            />
            <input
              type="search"
              placeholder="Search by type, movements, date, description…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-ds-md border border-ds-border bg-ds-bg py-2.5 pl-10 pr-4 text-ds-body-sm text-ds-text placeholder:text-ds-text-muted focus:border-ds-border-strong focus:outline-none focus:ring-1 focus:ring-ds-border-strong"
              aria-label="Search workouts"
            />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="rounded-ds-md border border-ds-border bg-ds-bg px-3 py-2 text-ds-body-sm text-ds-text focus:border-ds-border-strong focus:outline-none"
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
              className="rounded-ds-md border border-ds-border bg-ds-bg px-3 py-2 text-ds-body-sm text-ds-text focus:border-ds-border-strong focus:outline-none"
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
                className="text-ds-body-sm text-ds-text-muted hover:text-ds-text underline"
              >
                Clear
              </button>
            )}
          </div>
        </div>
        {data && (searchQuery || filterType || filterDuration) && (
          <p className="mt-2 text-ds-caption text-ds-text-muted">
            Showing {filtered.length} of {data.length} workouts
          </p>
        )}
      </div>

      <div className="card">
        {isLoading && <p className="text-sm text-ds-text-muted">Loading...</p>}
        {!isLoading && (!data || data.length === 0) && (
          <p className="text-sm text-ds-text-muted">No workouts yet.</p>
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
                    {w.wod.type} • {w.wod.duration} min
                  </div>
                  <p className="text-xs text-ds-text-muted">
                    {new Date(w.date).toLocaleDateString()} • {w.wod.movements.join(" / ")}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setViewWorkout(w)}
                  className="p-2 rounded-lg text-ds-text-muted hover:text-amber-500 hover:bg-amber-500/10 transition-colors"
                  title="View workout"
                  aria-label="View workout details"
                >
                  <Eye className="h-5 w-5" />
                </button>
              </li>
            ))}
          </ul>
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
                  {viewWorkout.wod.type} • {viewWorkout.wod.duration} min
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
              <dl className="space-y-3 text-sm">
                <div>
                  <dt className="text-ds-text-muted font-medium">Date & time</dt>
                  <dd className="text-ds-text mt-0.5">
                    {new Date(viewWorkout.date).toLocaleDateString(undefined, {
                      weekday: "short",
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}{" "}
                    at {new Date(viewWorkout.date).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })}
                  </dd>
                </div>
                {viewWorkout.completed && (
                  <div>
                    <dt className="text-ds-text-muted font-medium">Status</dt>
                    <dd className="text-ds-text mt-0.5 text-emerald-500 font-medium">Completed</dd>
                  </div>
                )}
                <div>
                  <dt className="text-ds-text-muted font-medium">Description</dt>
                  <dd className="text-ds-text mt-0.5">{viewWorkout.wod.description}</dd>
                </div>
                <div>
                  <dt className="text-ds-text-muted font-medium">Movements</dt>
                  <dd className="text-ds-text mt-0.5">
                    <ul className="list-disc list-inside space-y-0.5">
                      {viewWorkout.wod.movements.map((m, i) => (
                        <li key={i}>{m}</li>
                      ))}
                    </ul>
                  </dd>
                </div>
                <div>
                  <dt className="text-ds-text-muted font-medium">Scaling options</dt>
                  <dd className="text-ds-text mt-0.5">
                    <ul className="list-disc list-inside space-y-0.5">
                      {viewWorkout.scalingOptions.map((s, i) => (
                        <li key={i}>{s}</li>
                      ))}
                    </ul>
                  </dd>
                </div>
                <div>
                  <dt className="text-ds-text-muted font-medium">Intensity</dt>
                  <dd className="text-ds-text mt-0.5">{viewWorkout.intensityGuidance}</dd>
                </div>
              </dl>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}


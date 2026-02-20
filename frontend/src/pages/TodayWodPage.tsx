import { useState } from "react";
import { Play } from "lucide-react";
import { useWorkoutHistory, useCompleteWorkout } from "../features/workouts/workoutApi";
import { TimerOverlay } from "../components/timer";

export function TodayWodPage() {
  const { data: history, isLoading } = useWorkoutHistory();
  const latest = history?.[0];
  const completeMutation = useCompleteWorkout();
  const [rpe, setRpe] = useState<number>(8);
  const [notes, setNotes] = useState<string>("");
  const [timerOpen, setTimerOpen] = useState(false);

  const handleComplete = () => {
    if (!latest) return;
    completeMutation.mutate({
      workoutId: latest.id,
      rpe,
      notes: notes || undefined,
    });
  };

  return (
    <>
      {timerOpen && latest && (
        <TimerOverlay workout={latest} onClose={() => setTimerOpen(false)} />
      )}
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-ds-text">Today&apos;s WOD</h1>
        <p className="text-sm text-ds-text-muted mt-1">
          Most recent generated workout. Use this as your session for today.
        </p>
      </div>
      <div className="card">
        {isLoading && <p className="text-sm text-ds-text-muted">Loading...</p>}
        {!isLoading && !latest && (
          <p className="text-sm text-ds-text-muted">
            No WOD generated yet. Head to &quot;Generate&quot; to create one.
          </p>
        )}
        {!isLoading && latest && (
          <div className="space-y-3 text-sm">
            <div>
              <div className="font-medium text-ds-text">
                {latest.wod.type} • {latest.wod.duration} min
              </div>
              <p className="text-ds-text-muted mt-1">{latest.wod.description}</p>
            </div>
            <div>
              <h3 className="text-xs uppercase tracking-wide text-ds-text-muted mb-1">
                Warm-up
              </h3>
              <ul className="list-disc list-inside">
                {latest.warmup.map((w) => (
                  <li key={w}>{w}</li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-xs uppercase tracking-wide text-ds-text-muted mb-1">
                Movements
              </h3>
              <ul className="list-disc list-inside text-ds-text">
                {latest.wod.movements.map((m) => (
                  <li key={m}>{m}</li>
                ))}
              </ul>
            </div>
            {latest.finisher && (
              <div>
                <h3 className="text-xs uppercase tracking-wide text-ds-text-muted mb-1">
                  Finisher
                </h3>
                <ul className="list-disc list-inside text-ds-text">
                  {latest.finisher.map((f) => (
                    <li key={f}>{f}</li>
                  ))}
                </ul>
              </div>
            )}
            {/* Start Workout */}
            <div className="pt-3 border-t border-ds-border mt-2 flex justify-center">
              <button
                type="button"
                onClick={() => setTimerOpen(true)}
                className="flex items-center gap-2 rounded-ds-xl bg-ds-accent px-6 py-3 text-sm font-semibold text-stone-950 shadow-ds-sm hover:bg-ds-accent-hover active:scale-[0.98] transition-all duration-250"
              >
                <Play size={15} fill="currentColor" />
                Start Workout
              </button>
            </div>

            <div className="pt-3 border-t border-ds-border mt-2">
              <h3 className="text-xs uppercase tracking-wide text-ds-text-muted mb-2">
                Mark as completed
              </h3>
              <div className="flex flex-col md:flex-row gap-2 items-start md:items-center text-xs">
                <label className="flex items-center gap-1">
                  <span className="text-ds-text-muted">RPE</span>
                  <input
                    type="number"
                    min={1}
                    max={10}
                    value={rpe}
                    onChange={(e) => setRpe(Number(e.target.value))}
                    className="w-16 rounded-xl border border-ds-border bg-ds-surface-subtle px-2 py-1.5 text-ds-text"
                  />
                </label>
                <input
                  type="text"
                  placeholder="Notes (optional)"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="flex-1 rounded-xl border border-ds-border bg-ds-surface-subtle px-2 py-1.5 text-ds-text"
                />
                <button
                  type="button"
                  onClick={handleComplete}
                  className="btn-primary"
                  disabled={completeMutation.isPending}
                >
                  {completeMutation.isPending ? "Saving..." : "Mark done"}
                </button>
              </div>
              {completeMutation.isSuccess && (
                <p className="mt-1 text-[11px] text-emerald-600">Workout marked as completed.</p>
              )}
              {completeMutation.isError && (
                <p className="mt-1 text-[11px] text-red-500">
                  {(completeMutation.error as any).message ?? "Unable to mark workout completed"}
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
    </>
  );
}


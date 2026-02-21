import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { CheckCircle, Pencil, Play, RotateCw, Sparkles } from "lucide-react";
import { useWorkoutHistory, type WorkoutResponse } from "../features/workouts/workoutApi";
import { TimerOverlay } from "../components/timer";
import { WorkoutCard } from "../components/wod";

function isWorkoutFromToday(dateStr: string): boolean {
  const d = new Date(dateStr);
  const now = new Date();
  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  );
}

function getTodayWod(history: WorkoutResponse[] | undefined): WorkoutResponse | null {
  const latest = history?.[0];
  return latest && isWorkoutFromToday(latest.date) ? latest : null;
}

export function TodayWodPage() {
  const { data: history, isLoading } = useWorkoutHistory();
  const todayWod = useMemo(() => getTodayWod(history), [history]);
  const [timerOpen, setTimerOpen] = useState(false);

  return (
    <>
      {timerOpen && todayWod && (
        <TimerOverlay workout={todayWod} onClose={() => setTimerOpen(false)} />
      )}
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-ds-text">Today&apos;s WOD</h1>
        <p className="text-sm text-ds-text-muted mt-1">
          Your session for today. Generate a workout if you haven&apos;t yet.
        </p>
      </div>
      {isLoading && (
        <div className="rounded-ds-lg border border-ds-border bg-ds-surface p-ds-4">
          <p className="text-sm text-ds-text-muted">Loading...</p>
        </div>
      )}
      {!isLoading && !todayWod && (
        <div className="rounded-ds-lg border border-ds-border bg-ds-surface p-ds-6 text-center space-y-4">
          <p className="text-sm text-ds-text-muted">
            No workout for today yet. Generate one to get started.
          </p>
          <Link
            to="/wod/generate"
            className="inline-flex items-center gap-2 rounded-ds-xl bg-ds-accent px-6 py-3 text-sm font-semibold text-stone-950 shadow-ds-sm hover:bg-ds-accent-hover active:scale-[0.98] transition-all duration-250"
          >
            <Sparkles className="h-5 w-5" />
            Generate workout
          </Link>
        </div>
      )}
      {!isLoading && todayWod && (
          <>
            {todayWod.completed && (
              <div className="flex items-center gap-2 text-emerald-400 mb-3">
                <CheckCircle size={26} className="shrink-0" aria-hidden />
                <span className="font-medium">Done</span>
              </div>
            )}
            {(todayWod.intendedStimulus || todayWod.stimulusNote || (todayWod.warmup?.length > 0)) && (
              <div className="rounded-ds-lg border border-ds-border bg-ds-surface-subtle p-ds-4 mb-4 space-y-2 text-sm">
                {todayWod.intendedStimulus && (
                  <p className="text-ds-text"><span className="text-ds-text-muted font-medium">Stimulus:</span> {todayWod.intendedStimulus}</p>
                )}
                {todayWod.stimulusNote && (
                  <p className="text-ds-text-muted italic">{todayWod.stimulusNote}</p>
                )}
                {todayWod.warmup && todayWod.warmup.length > 0 && (
                  <div>
                    <p className="text-ds-text-muted font-medium mb-1">Warm-up</p>
                    <ul className="list-disc list-inside text-ds-text">
                      {todayWod.warmup.map((s) => (
                        <li key={s}>{s}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
            <WorkoutCard wod={todayWod.wod}>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setTimerOpen(true)}
                  className="col-span-2 flex items-center justify-center gap-2 rounded-ds-xl bg-ds-accent px-6 py-3 text-sm font-semibold text-stone-950 shadow-ds-sm hover:bg-ds-accent-hover active:scale-[0.98] transition-all duration-250 whitespace-nowrap"
                >
                  <Play size={15} fill="currentColor" />
                  Start Workout
                </button>
                <Link
                  to="/wod/builder"
                  className="flex items-center justify-center gap-2 rounded-ds-xl border border-ds-border bg-ds-surface-subtle px-6 py-3 text-sm font-semibold text-ds-text hover:border-ds-border-strong hover:bg-ds-surface transition-all duration-250 active:scale-[0.98] whitespace-nowrap"
                >
                  <Pencil size={15} className="shrink-0" />
                  Customize WOD
                </Link>
                <Link
                  to="/wod/generate"
                  className="flex items-center justify-center gap-2 rounded-ds-xl border border-ds-border bg-ds-surface-subtle px-6 py-3 text-sm font-semibold text-ds-text hover:border-ds-border-strong hover:bg-ds-surface transition-all duration-250 active:scale-[0.98] whitespace-nowrap"
                >
                  <RotateCw size={15} className="shrink-0" />
                  Generate new WOD
                </Link>
              </div>
            </WorkoutCard>
          </>
        )}
    </div>
    </>
  );
}


import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { CheckCircle, Clock, Repeat2, Layers, ChevronRight } from 'lucide-react';
import { useCompleteWorkout } from '../../features/workouts/workoutApi';
import { formatTime, needsRepCounter } from '../../features/timer/timerUtils';
import type { WorkoutSessionResult } from '../../features/timer/timerTypes';
import type { WorkoutResponse } from '../../features/workouts/workoutApi';
import { Button } from '../ui/Button';

interface WorkoutSummaryProps {
  workout: WorkoutResponse;
  result: WorkoutSessionResult;
  onClose: () => void;
}

export function WorkoutSummary({ workout, result, onClose }: WorkoutSummaryProps) {
  const [rpe, setRpe] = useState(8);
  const completeMutation = useCompleteWorkout();
  const queryClient = useQueryClient();
  const showReps = needsRepCounter(result.config.type);
  // Total rounds completed: for AMRAP/For Time = rounds user advanced; for EMOM/Tabata = preset total
  const totalRoundsCompleted =
    result.config.type === 'AMRAP' || result.config.type === 'FOR_TIME'
      ? result.repsByRound.length
      : result.config.totalRounds;

  const handleSave = () => {
    completeMutation.mutate(
      {
        workoutId: workout.id,
        rpe,
        completionTime: Math.round(result.totalElapsed),
        roundsOrReps: result.totalReps || undefined,
      },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ['workouts', 'history'] });
          onClose();
        },
      },
    );
  };

  return (
    <div
      className="w-full max-w-sm flex flex-col items-center gap-5 px-6"
      style={{ animation: 'summaryIn 0.4s cubic-bezier(0.22,1,0.36,1) both' }}
    >
      {/* Header */}
      <div className="flex flex-col items-center gap-2 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/15">
          <CheckCircle className="text-emerald-400" size={26} />
        </div>
        <h2 className="text-2xl font-bold text-ds-text">Workout Complete!</h2>
        <p className="text-sm text-ds-text-muted">
          {workout.wod.type} · {workout.wod.description}
        </p>
      </div>

      {/* Stats: total time, rounds completed, and (for AMRAP/For Time) total reps */}
      <div className={`w-full grid gap-3 ${showReps ? 'grid-cols-3' : 'grid-cols-2'}`}>
        <StatBox
          icon={<Clock size={15} className="text-ds-text-muted" />}
          value={formatTime(Math.round(result.totalElapsed))}
          label="Total time"
        />
        <StatBox
          icon={<Layers size={15} className="text-ds-text-muted" />}
          value={String(totalRoundsCompleted)}
          label="Rounds"
        />
        {showReps && (
          <StatBox
            icon={<Repeat2 size={15} className="text-ds-text-muted" />}
            value={String(result.totalReps)}
            label="Total reps"
          />
        )}
      </div>

      {/* Per-round rep breakdown (AMRAP / FOR_TIME) */}
      {showReps && result.repsByRound.length > 1 && (
        <div className="w-full card">
          <h3 className="text-xs uppercase tracking-widest text-ds-text-muted mb-3">
            Reps per round
          </h3>
          <div className="flex flex-wrap gap-2">
            {result.repsByRound.map((reps, i) => (
              <div
                key={i}
                className="flex flex-col items-center rounded-ds-md bg-ds-surface-subtle px-3 py-2 min-w-[3rem]"
              >
                <span className="text-[10px] text-ds-text-muted">Rnd {i + 1}</span>
                <span className="text-lg font-bold text-ds-text tabular-nums">{reps}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* RPE slider */}
      <div className="w-full card">
        <h3 className="text-xs uppercase tracking-widest text-ds-text-muted mb-3">
          How hard was it?
        </h3>
        <div className="flex items-center gap-3">
          <input
            type="range"
            min={1}
            max={10}
            step={1}
            value={rpe}
            onChange={(e) => setRpe(Number(e.target.value))}
            className="flex-1 h-1.5 rounded-full cursor-pointer"
            style={{ accentColor: '#f59e0b' }}
          />
          <span className="w-8 text-center text-lg font-bold text-ds-text tabular-nums">{rpe}</span>
          <span className="text-xs text-ds-text-muted">RPE</span>
        </div>
        <div className="flex justify-between mt-1 text-[10px] text-ds-text-faint px-0.5">
          <span>Easy</span>
          <span>Max effort</span>
        </div>
      </div>

      {/* Actions */}
      <div className="w-full flex flex-col gap-2">
        <Button
          variant="primary"
          fullWidth
          onClick={handleSave}
          isLoading={completeMutation.isPending}
        >
          <ChevronRight size={15} />
          Save Workout
        </Button>
        <Button variant="ghost" fullWidth onClick={onClose} disabled={completeMutation.isPending}>
          Discard &amp; Close
        </Button>
      </div>

      {completeMutation.isError && (
        <p className="text-xs text-red-400 text-center">
          Failed to save. Please try again.
        </p>
      )}
    </div>
  );
}

function StatBox({
  icon,
  value,
  label,
}: {
  icon?: React.ReactNode;
  value: string;
  label: string;
}) {
  return (
    <div className="card flex flex-col items-center gap-1 py-4">
      {icon}
      <span className="text-2xl font-black text-ds-text tabular-nums leading-tight">{value}</span>
      <span className="text-[10px] uppercase tracking-widest text-ds-text-muted">{label}</span>
    </div>
  );
}

import { Link } from "react-router-dom";
import { Flame, Sparkles } from "lucide-react";
import { useWorkoutHistory } from "../features/workouts/workoutApi";
import { useProgressAnalytics } from "../features/analytics/analyticsApi";
import {
  Card,
  Button,
  SectionHeader,
  ProgressCard,
  WorkoutCard,
} from "../components/ui";

export function DashboardPage() {
  const { data: history, isLoading: historyLoading } = useWorkoutHistory();
  const { data: analytics } = useProgressAnalytics();
  const latest = history?.[0];

  return (
    <div className="space-y-ds-5">
      <div className="space-y-0.5">
        <h1 className="text-ds-display font-bold tracking-tight text-ds-text">
          Dashboard
        </h1>
        <p className="text-ds-body-sm text-ds-text-muted">
          Your training at a glance.
        </p>
      </div>

      {/* Today's Workout (left) + Activity (right) side by side */}
      <section className="grid grid-cols-1 gap-ds-3 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-ds-3">
          <SectionHeader
            title="Today's Workout"
            subtitle={latest ? "Ready when you are." : "Generate one to get started."}
            action={
              !latest && (
                <Link to="/wod/generate">
                  <Button variant="primary" size="lg">
                    <Sparkles className="h-5 w-5" />
                    Generate Workout
                  </Button>
                </Link>
              )
            }
          />
          {historyLoading && (
            <Card className="flex items-center justify-center py-ds-6">
              <div className="flex flex-col items-center gap-ds-2 text-ds-text-muted">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-ds-accent/50 border-t-ds-accent" />
                <span className="text-ds-body-sm">Loading…</span>
              </div>
            </Card>
          )}
          {!historyLoading && latest && (
            <WorkoutCard
              title={latest.wod.type}
              wod={latest.wod}
              movementPreviewCount={4}
              primaryActionLabel="Start Workout"
              primaryActionHref="/wod/today"
            />
          )}
          {!historyLoading && !latest && (
            <Card className="py-ds-5 text-center sm:py-ds-6" padding="lg">
              <div className="mx-auto max-w-sm space-y-ds-3">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-ds-xl bg-ds-stat-blue text-ds-text shadow-ds-sm">
                  <Flame className="h-7 w-7" />
                </div>
                <h2 className="text-ds-heading font-semibold text-ds-text">
                  No workout yet
                </h2>
                <p className="text-ds-body-sm text-ds-text-muted">
                  Generate a WOD from your equipment and goals.
                </p>
                <Link to="/wod/generate" className="inline-block">
                  <Button variant="primary" size="lg">
                    <Sparkles className="h-5 w-5" />
                    Generate Workout
                  </Button>
                </Link>
              </div>
            </Card>
          )}
        </div>
        <div>
          <ProgressCard title="Activity">
            <div className="space-y-ds-2 text-ds-body-sm">
              <div className="flex justify-between">
                <span className="text-ds-text-muted">Completed</span>
                <span className="font-semibold text-ds-text">
                  {analytics?.totalSessions ?? 0}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-ds-text-muted">Avg RPE</span>
                <span className="font-semibold text-ds-text">
                  {analytics ? analytics.averageRpe.toFixed(1) : "—"}
                </span>
              </div>
              <p className="pt-ds-1 text-ds-caption text-ds-text-muted">
                Vary intensity; avoid back-to-back high RPE days.
              </p>
            </div>
          </ProgressCard>
        </div>
      </section>
    </div>
  );
}

import { useProgressAnalytics } from "../features/analytics/analyticsApi";
import { ChartCard } from "../components/ui";

export function AnalyticsPage() {
  const { data, isLoading } = useProgressAnalytics();

  return (
    <div className="space-y-ds-4">
      <div className="space-y-0.5">
        <h1 className="text-ds-display font-bold tracking-tight text-ds-text">
          Analytics
        </h1>
        <p className="text-ds-body-sm text-ds-text-muted">
          Session trends.
        </p>
      </div>
      <div className="grid grid-cols-1 gap-ds-3 md:grid-cols-[1.4fr,0.6fr]">
        <ChartCard title="Summary" className="h-80">
          <div className="space-y-ds-2 text-ds-body-sm">
            {isLoading && <p className="text-ds-body-sm text-ds-text-muted">Loading…</p>}
            {!isLoading && (
              <div className="flex justify-between">
                <span className="text-ds-text-muted">Sessions</span>
                <span className="font-semibold text-ds-text">{data?.totalSessions ?? 0}</span>
              </div>
            )}
          </div>
        </ChartCard>
      </div>
    </div>
  );
}

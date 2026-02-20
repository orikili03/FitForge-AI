import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { useProgressAnalytics } from "../features/analytics/analyticsApi";
import { chartColors } from "../design-system/tokens";
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
          RPE and session trends.
        </p>
      </div>
      <div className="grid grid-cols-1 gap-ds-3 md:grid-cols-[1.4fr,0.6fr]">
        <ChartCard title="RPE over time" subtitle="Session history" className="h-80">
          {isLoading && <p className="text-ds-body-sm text-ds-text-muted">Loading…</p>}
          {!isLoading && data && data.points.length > 0 && (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.points}>
                <XAxis
                  dataKey="date"
                  tickFormatter={(v) => new Date(v).toLocaleDateString()}
                  stroke={chartColors.axis}
                />
                <YAxis stroke={chartColors.axis} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: chartColors.tooltipBg,
                    border: `1px solid ${chartColors.tooltipBorder}`,
                    borderRadius: "12px",
                    boxShadow: "0 0 0 1px rgba(255,255,255,0.04), 0 8px 24px rgba(0,0,0,0.18)",
                  }}
                  labelStyle={{ color: chartColors.text }}
                  labelFormatter={(v) => new Date(v).toLocaleString()}
                />
                <Line
                  type="monotone"
                  dataKey="rpe"
                  stroke={chartColors.line}
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
          {!isLoading && (!data || data.points.length === 0) && (
            <p className="text-ds-body-sm text-ds-text-muted">
              No completion data yet.
            </p>
          )}
        </ChartCard>
        <ChartCard title="Summary" className="h-80">
          <div className="space-y-ds-2 text-ds-body-sm">
            <div className="flex justify-between">
              <span className="text-ds-text-muted">Sessions</span>
              <span className="font-semibold text-ds-text">{data?.totalSessions ?? 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-ds-text-muted">Avg RPE</span>
              <span className="font-semibold text-ds-text">
                {data ? data.averageRpe.toFixed(1) : "0.0"}
              </span>
            </div>
            <p className="pt-ds-1 text-ds-caption text-ds-text-muted">
              Vary intensity; avoid back-to-back high RPE.
            </p>
          </div>
        </ChartCard>
      </div>
    </div>
  );
}

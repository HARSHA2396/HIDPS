import { useEffect, useState } from 'react';
import {
  BellRing,
  Bot,
  Radar,
  ShieldCheck,
  ShieldEllipsis,
  Siren,
  Waypoints,
} from 'lucide-react';
import { apiFetch } from '../lib/api';
import { formatRelativeTime, getSeverityTone, sortAlertsNewest } from '../lib/insights';
import { AnalyticsPanel } from './AnalyticsPanel';
import { GlobalMap } from './GlobalMap';
import type {
  AlertData,
  CorrelationCase,
  ModelStatus,
  PendingAction,
  TelemetrySourceStatus,
} from '../types';

interface DashboardPageProps {
  alerts: AlertData[];
}

function formatPercent(value: number) {
  return `${(value * 100).toFixed(0)}%`;
}

export function DashboardPage({ alerts }: DashboardPageProps) {
  const [telemetrySources, setTelemetrySources] = useState<TelemetrySourceStatus[]>([]);
  const [pendingActions, setPendingActions] = useState<PendingAction[]>([]);
  const [cases, setCases] = useState<CorrelationCase[]>([]);
  const [modelStatus, setModelStatus] = useState<ModelStatus | null>(null);

  useEffect(() => {
    let ignore = false;

    const loadOverview = async () => {
      try {
        const [telemetryResponse, pendingResponse, casesResponse, modelResponse] = await Promise.all([
          apiFetch('/api/telemetry/sources'),
          apiFetch('/api/action/pending'),
          apiFetch('/api/correlation/cases'),
          apiFetch('/api/model/status'),
        ]);
        if (!telemetryResponse.ok || !pendingResponse.ok || !casesResponse.ok || !modelResponse.ok) {
          throw new Error('Overview services unavailable.');
        }
        const [telemetryData, pendingData, casesData, modelData] = (await Promise.all([
          telemetryResponse.json(),
          pendingResponse.json(),
          casesResponse.json(),
          modelResponse.json(),
        ])) as [TelemetrySourceStatus[], PendingAction[], CorrelationCase[], ModelStatus];

        if (!ignore) {
          setTelemetrySources(telemetryData);
          setPendingActions(pendingData);
          setCases(casesData);
          setModelStatus(modelData);
        }
      } catch {
        if (!ignore) {
          setTelemetrySources([]);
          setPendingActions([]);
          setCases([]);
          setModelStatus(null);
        }
      }
    };

    void loadOverview();
    const intervalId = window.setInterval(() => {
      void loadOverview();
    }, 15_000);

    return () => {
      ignore = true;
      window.clearInterval(intervalId);
    };
  }, [alerts.length]);

  const activeAlerts = alerts.filter((alert) => alert.status !== 'closed');
  const unassignedAlerts = activeAlerts.filter((alert) => !alert.assigned_analyst).length;
  const highRiskAlerts = activeAlerts.filter(
    (alert) => alert.severity === 'Critical' || alert.severity === 'High',
  );
  const assignedAlerts = activeAlerts.length - unassignedAlerts;
  const averageConfidence =
    alerts.length === 0 ? 0 : alerts.reduce((sum, alert) => sum + alert.confidence, 0) / alerts.length;
  const latestAlerts = sortAlertsNewest(alerts).slice(0, 6);

  const summaryCards = [
    {
      label: 'Active Queue',
      value: activeAlerts.length,
      sublabel: `${highRiskAlerts.length} high-risk detections require analyst attention.`,
      icon: BellRing,
      tone: 'text-amber-300',
    },
    {
      label: 'Assigned Cases',
      value: assignedAlerts,
      sublabel: `${unassignedAlerts} alerts are still waiting for ownership.`,
      icon: ShieldCheck,
      tone: 'text-emerald-300',
    },
    {
      label: 'Escalation Watch',
      value: cases.length,
      sublabel: `${pendingActions.length} mitigation approvals are queued.`,
      icon: Siren,
      tone: 'text-fuchsia-300',
    },
    {
      label: 'Model Confidence',
      value: formatPercent(averageConfidence),
      sublabel: modelStatus?.enabled
        ? `${modelStatus.runtime.toUpperCase()} runtime live with ${modelStatus.labels.length || 1} class channels.`
        : 'Runtime disabled. Alerts currently use simulation and rule-derived defaults.',
      icon: Bot,
      tone: 'text-cyan-300',
    },
  ];

  return (
    <main className="flex-1 overflow-auto p-4 md:p-5 space-y-5">
      <section className="rounded-[30px] border border-white/6 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.14),transparent_35%),radial-gradient(circle_at_top_right,rgba(56,189,248,0.08),transparent_30%),linear-gradient(180deg,rgba(15,23,42,0.98),rgba(8,15,28,0.98))] p-5 shadow-[0_30px_80px_rgba(2,12,27,0.35)]">
        <div className="grid gap-5 xl:grid-cols-[1.4fr_0.9fr]">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/16 bg-cyan-400/10 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-cyan-200">
              <Radar className="h-4 w-4" />
              Live Detection Fabric
            </div>
            <h1 className="mt-5 max-w-3xl text-3xl font-semibold leading-tight text-white md:text-4xl">
              Monitor your protected assets, surface real threats fast, and keep the analyst flow
              simple under pressure.
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300">
              This command view merges telemetry health, AI runtime visibility, open queue pressure,
              and response readiness into one place so you can demo clearly and operate confidently.
            </p>

            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-white/6 bg-slate-950/70 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Runtime</p>
                <p className="mt-2 text-lg font-semibold text-white">
                  {modelStatus?.enabled ? modelStatus.runtime.toUpperCase() : 'Disabled'}
                </p>
                <p className="mt-2 text-xs text-slate-400">
                  Alert threshold {modelStatus ? modelStatus.alert_threshold.toFixed(2) : '0.55'}
                </p>
              </div>
              <div className="rounded-2xl border border-white/6 bg-slate-950/70 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Telemetry Sources</p>
                <p className="mt-2 text-lg font-semibold text-white">
                  {telemetrySources.filter((source) => source.status !== 'Delayed').length}
                </p>
                <p className="mt-2 text-xs text-slate-400">Collectors reporting into the control plane.</p>
              </div>
              <div className="rounded-2xl border border-white/6 bg-slate-950/70 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Prevention Policy</p>
                <p className="mt-2 text-lg font-semibold text-white">
                  {modelStatus?.auto_response_enabled ? 'Auto Response' : 'Analyst Gated'}
                </p>
                <p className="mt-2 text-xs text-slate-400">
                  Prevent threshold {modelStatus ? modelStatus.prevent_threshold.toFixed(2) : '0.85'}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-[26px] border border-white/6 bg-slate-950/70 p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Detection Status</p>
                <p className="mt-2 text-xl font-semibold text-white">
                  {modelStatus?.enabled ? 'Model online and scoring' : 'Fallback simulation mode'}
                </p>
              </div>
              <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-200">
                {pendingActions.length > 0 ? `${pendingActions.length} pending actions` : 'response ready'}
              </div>
            </div>
            <div className="mt-5 space-y-3">
              {latestAlerts.slice(0, 4).map((alert) => (
                <div key={alert.id} className="rounded-2xl border border-white/6 bg-slate-900/70 p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-semibold text-white">{alert.attack_type}</p>
                      <p className="mt-1 text-xs text-slate-500">
                        {alert.asset_name} • {alert.source_ip} • {formatRelativeTime(alert.timestamp)}
                      </p>
                    </div>
                    <span className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${getSeverityTone(alert.severity)}`}>
                      {alert.severity}
                    </span>
                  </div>
                </div>
              ))}
              {latestAlerts.length === 0 && (
                <div className="rounded-2xl border border-white/6 bg-slate-900/70 p-4 text-sm text-slate-400">
                  Waiting for telemetry. Use `/api/ingest/features` or `/api/model/evaluate` to start the stream.
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {summaryCards.map((card) => (
          <div
            key={card.label}
            className="rounded-[26px] border border-white/6 bg-[linear-gradient(180deg,rgba(15,23,42,0.96),rgba(8,15,28,0.96))] p-5"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">{card.label}</p>
                <p className={`mt-3 text-3xl font-bold ${card.tone}`}>{card.value}</p>
              </div>
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/6 bg-slate-950/80">
                <card.icon className={`h-5 w-5 ${card.tone}`} />
              </div>
            </div>
            <p className="mt-4 text-xs leading-6 text-slate-400">{card.sublabel}</p>
          </div>
        ))}
      </section>

      <section className="grid grid-cols-1 gap-4 xl:grid-cols-12">
        <div className="xl:col-span-8">
          <GlobalMap alerts={alerts.slice(0, 24)} />
        </div>
        <div className="space-y-4 xl:col-span-4">
          <div className="rounded-[26px] border border-white/6 bg-[linear-gradient(180deg,rgba(15,23,42,0.96),rgba(8,15,28,0.96))] p-5">
            <div className="mb-4 flex items-center gap-2">
              <Bot className="h-4 w-4 text-cyan-300" />
              <h2 className="text-lg font-bold text-white">Model Runtime</h2>
            </div>
            {modelStatus ? (
              <div className="space-y-3 text-sm">
                <div className="rounded-2xl border border-white/6 bg-slate-950/70 p-3">
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Mode</p>
                  <p className="mt-2 font-semibold text-white">
                    {modelStatus.enabled ? `${modelStatus.runtime.toUpperCase()} active` : 'Disabled'}
                  </p>
                </div>
                <div className="rounded-2xl border border-white/6 bg-slate-950/70 p-3">
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Feature Order</p>
                  <p className="mt-2 text-slate-300">
                    {modelStatus.feature_order.length > 0
                      ? modelStatus.feature_order.join(', ')
                      : 'Feature order not configured yet.'}
                  </p>
                </div>
                <div className="rounded-2xl border border-white/6 bg-slate-950/70 p-3">
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Labels</p>
                  <p className="mt-2 text-slate-300">
                    {modelStatus.labels.length > 0
                      ? modelStatus.labels.join(', ')
                      : 'No labels configured.'}
                  </p>
                </div>
              </div>
            ) : (
              <div className="rounded-2xl border border-white/6 bg-slate-950/70 p-4 text-sm text-slate-400">
                Model status is unavailable right now.
              </div>
            )}
          </div>

          <div className="rounded-[26px] border border-white/6 bg-[linear-gradient(180deg,rgba(15,23,42,0.96),rgba(8,15,28,0.96))] p-5">
            <div className="mb-4 flex items-center gap-2">
              <Waypoints className="h-4 w-4 text-amber-300" />
              <h2 className="text-lg font-bold text-white">Response Queue</h2>
            </div>
            <div className="space-y-3">
              {pendingActions.slice(0, 4).map((action) => (
                <div key={action.action_id} className="rounded-2xl border border-white/6 bg-slate-950/70 p-4">
                  <p className="text-sm font-semibold text-white">{action.action_type}</p>
                  <p className="mt-1 text-xs text-slate-500">
                    {action.target_ip} • {action.requested_by}
                  </p>
                  <p className="mt-2 text-xs text-slate-300">{action.recommended_playbook}</p>
                </div>
              ))}
              {pendingActions.length === 0 && (
                <div className="rounded-2xl border border-white/6 bg-slate-950/70 p-4 text-sm text-slate-400">
                  No mitigation approvals are pending.
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <AnalyticsPanel alerts={alerts} />

      <section className="grid grid-cols-1 gap-4 xl:grid-cols-12">
        <div className="rounded-[26px] border border-white/6 bg-[linear-gradient(180deg,rgba(15,23,42,0.96),rgba(8,15,28,0.96))] p-5 xl:col-span-7">
          <div className="mb-4 flex items-center gap-2">
            <ShieldEllipsis className="h-4 w-4 text-cyan-300" />
            <div>
              <h2 className="text-lg font-bold text-white">Telemetry Readiness</h2>
              <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                Collector freshness, ingestion health, and source coverage
              </p>
            </div>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            {telemetrySources.slice(0, 6).map((source) => (
              <div key={source.source_id} className="rounded-2xl border border-white/6 bg-slate-950/70 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-white">{source.source_id}</p>
                    <p className="mt-1 text-xs uppercase tracking-[0.18em] text-slate-500">{source.kind}</p>
                  </div>
                  <span className="rounded-full border border-cyan-500/20 bg-cyan-500/10 px-2.5 py-1 text-xs font-semibold text-cyan-200">
                    {source.status}
                  </span>
                </div>
                <p className="mt-3 text-sm text-slate-300">{source.coverage}</p>
                <p className="mt-2 text-xs text-slate-500">Last seen {formatRelativeTime(source.last_seen)}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[26px] border border-white/6 bg-[linear-gradient(180deg,rgba(15,23,42,0.96),rgba(8,15,28,0.96))] p-5 xl:col-span-5">
          <div className="mb-4">
            <h2 className="text-lg font-bold text-white">Priority Campaigns</h2>
            <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
              Correlated activity that leadership should track first
            </p>
          </div>
          <div className="space-y-3">
            {cases.slice(0, 5).map((item) => (
              <div key={item.case_id} className="rounded-2xl border border-white/6 bg-slate-950/70 p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-white">{item.title}</p>
                    <p className="mt-2 text-sm text-slate-300">{item.summary}</p>
                  </div>
                  <span className="rounded-full border border-fuchsia-500/20 bg-fuchsia-500/10 px-2.5 py-1 text-xs font-semibold text-fuchsia-200">
                    {formatPercent(item.risk_score)}
                  </span>
                </div>
              </div>
            ))}
            {cases.length === 0 && (
              <div className="rounded-2xl border border-white/6 bg-slate-950/70 p-4 text-sm text-slate-400">
                Correlation cases will appear here as linked detections accumulate.
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}

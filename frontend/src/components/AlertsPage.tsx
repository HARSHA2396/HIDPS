import { CheckCircle2, FileWarning, ShieldAlert, UserRoundCheck } from 'lucide-react';
import { ActionPanel } from './ActionPanel';
import { AlertStream } from './AlertStream';
import { ThreatPanel } from './ThreatPanel';
import { apiFetch } from '../lib/api';
import { formatRelativeTime } from '../lib/insights';
import type { AlertData, AuthUser } from '../types';

interface AlertsPageProps {
  alerts: AlertData[];
  selectedAlert: AlertData | null;
  onSelectAlert: (alert: AlertData) => void;
  onAlertUpdate: (alert: AlertData) => void;
  currentUser: AuthUser;
}

export function AlertsPage({
  alerts,
  selectedAlert,
  onSelectAlert,
  onAlertUpdate,
  currentUser,
}: AlertsPageProps) {
  const escalatedCount = alerts.filter((alert) => alert.status === 'escalated').length;
  const closedCount = alerts.filter((alert) => alert.status === 'closed').length;
  const reviewedCount = alerts.filter((alert) => alert.disposition !== 'unreviewed').length;
  const openCount = alerts.filter((alert) => alert.status !== 'closed').length;

  const assignToMe = async (alert: AlertData) => {
    try {
      const response = await apiFetch('/api/alerts/workflow', {
        method: 'POST',
        body: JSON.stringify({
          alert_id: alert.id,
          analyst: currentUser.name,
          assigned_analyst: currentUser.name,
          status: 'investigating',
          report_summary: alert.report_excerpt || `Alert assigned to ${currentUser.name} for investigation.`,
        }),
      });
      if (!response.ok) {
        throw new Error('Assignment failed.');
      }
      const updatedAlert = (await response.json()) as AlertData;
      onAlertUpdate(updatedAlert);
      onSelectAlert(updatedAlert);
    } catch {
      // Quiet failure keeps the queue usable during a live demo.
    }
  };

  return (
    <main className="flex-1 overflow-auto p-4 md:p-5 space-y-5">
      <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-[24px] border border-white/6 bg-[linear-gradient(180deg,rgba(15,23,42,0.96),rgba(8,15,28,0.96))] p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Open Alerts</p>
              <p className="mt-3 text-3xl font-bold text-white">{openCount}</p>
            </div>
            <ShieldAlert className="h-6 w-6 text-red-300" />
          </div>
        </div>
        <div className="rounded-[24px] border border-white/6 bg-[linear-gradient(180deg,rgba(15,23,42,0.96),rgba(8,15,28,0.96))] p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Escalated</p>
              <p className="mt-3 text-3xl font-bold text-white">{escalatedCount}</p>
            </div>
            <FileWarning className="h-6 w-6 text-fuchsia-300" />
          </div>
        </div>
        <div className="rounded-[24px] border border-white/6 bg-[linear-gradient(180deg,rgba(15,23,42,0.96),rgba(8,15,28,0.96))] p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Reviewed</p>
              <p className="mt-3 text-3xl font-bold text-white">{reviewedCount}</p>
            </div>
            <UserRoundCheck className="h-6 w-6 text-cyan-300" />
          </div>
        </div>
        <div className="rounded-[24px] border border-white/6 bg-[linear-gradient(180deg,rgba(15,23,42,0.96),rgba(8,15,28,0.96))] p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Closed</p>
              <p className="mt-3 text-3xl font-bold text-white">{closedCount}</p>
            </div>
            <CheckCircle2 className="h-6 w-6 text-emerald-300" />
          </div>
        </div>
      </section>

      <section className="rounded-[28px] border border-white/6 bg-[linear-gradient(180deg,rgba(15,23,42,0.96),rgba(8,15,28,0.96))] p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Assigned Workbench</p>
            <h2 className="mt-2 text-2xl font-semibold text-white">
              {selectedAlert ? selectedAlert.attack_type : 'Select an alert to begin triage'}
            </h2>
            <p className="mt-2 text-sm text-slate-400">
              {selectedAlert
                ? `${selectedAlert.id} • ${selectedAlert.asset_name} • ${formatRelativeTime(selectedAlert.timestamp)}`
                : 'The analyst workbench combines evidence review, model explainability, report writing, and response actions in one flow.'}
            </p>
          </div>
          {selectedAlert && (
            <div className="rounded-2xl border border-cyan-400/20 bg-cyan-400/10 px-4 py-3 text-sm text-cyan-100">
              {selectedAlert.assigned_analyst || 'No owner yet'} • {selectedAlert.queue_level} •{' '}
              {selectedAlert.status}
            </div>
          )}
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 xl:grid-cols-12">
        <div className="xl:col-span-4 min-h-0">
          <AlertStream
            alerts={alerts}
            selectedAlertId={selectedAlert?.id}
            onSelectAlert={onSelectAlert}
            onAssignAlert={(alert) => void assignToMe(alert)}
          />
        </div>
        <div className="space-y-4 xl:col-span-8">
          <ThreatPanel
            selectedAlert={selectedAlert}
            onAlertUpdate={onAlertUpdate}
            currentUser={currentUser}
          />
          <ActionPanel selectedAlert={selectedAlert} currentUser={currentUser} />
        </div>
      </section>
    </main>
  );
}

import { CheckCircle2, FileWarning, ShieldAlert, UserRoundCheck } from 'lucide-react';
import { ActionPanel } from './ActionPanel';
import { AlertStream } from './AlertStream';
import { ThreatPanel } from './ThreatPanel';
import { apiFetch } from '../lib/api';
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
      // Keep the interaction resilient and avoid interrupting the queue with hard failures.
    }
  };

  return (
    <main className="flex-1 overflow-auto p-4 space-y-4">
      <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="glass-panel rounded-xl border border-slate-800 bg-slate-900 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-wider text-slate-500">Open Alerts</p>
              <p className="mt-2 text-3xl font-bold text-white">{openCount}</p>
            </div>
            <ShieldAlert className="h-6 w-6 text-red-400" />
          </div>
        </div>
        <div className="glass-panel rounded-xl border border-slate-800 bg-slate-900 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-wider text-slate-500">Escalated</p>
              <p className="mt-2 text-3xl font-bold text-white">{escalatedCount}</p>
            </div>
            <FileWarning className="h-6 w-6 text-fuchsia-400" />
          </div>
        </div>
        <div className="glass-panel rounded-xl border border-slate-800 bg-slate-900 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-wider text-slate-500">Reviewed</p>
              <p className="mt-2 text-3xl font-bold text-white">{reviewedCount}</p>
            </div>
            <UserRoundCheck className="h-6 w-6 text-cyan-400" />
          </div>
        </div>
        <div className="glass-panel rounded-xl border border-slate-800 bg-slate-900 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-wider text-slate-500">Closed</p>
              <p className="mt-2 text-3xl font-bold text-white">{closedCount}</p>
            </div>
            <CheckCircle2 className="h-6 w-6 text-emerald-400" />
          </div>
        </div>
      </section>

      <section className="grid grid-cols-12 gap-4">
        <div className="col-span-12 xl:col-span-4 h-[calc(100vh-13rem)]">
          <AlertStream
            alerts={alerts}
            selectedAlertId={selectedAlert?.id}
            onSelectAlert={onSelectAlert}
            onAssignAlert={(alert) => void assignToMe(alert)}
          />
        </div>
        <div className="col-span-12 xl:col-span-8">
          <ThreatPanel
            selectedAlert={selectedAlert}
            onAlertUpdate={onAlertUpdate}
            currentUser={currentUser}
          />
        </div>
      </section>

      <section className="grid grid-cols-12 gap-4">
        <div className="col-span-12 xl:col-span-4">
          <ActionPanel selectedAlert={selectedAlert} currentUser={currentUser} />
        </div>
        <div className="col-span-12 xl:col-span-8">
          <div className="glass-panel rounded-xl border border-slate-800 bg-slate-900 p-4">
            <h2 className="text-lg font-bold tracking-wide text-white">Alert Workspace</h2>
            <p className="mt-2 text-sm text-slate-400">
              This page combines the live alert queue with triage, threat intel, playbook steps,
              escalation, report writing, and response options in one analyst workflow.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}

import type { AlertData } from '../types';
import { AlertCircle, AlertTriangle, Info, ShieldAlert, UserPlus } from 'lucide-react';

interface AlertStreamProps {
  alerts: AlertData[];
  selectedAlertId?: string | null;
  onSelectAlert: (alert: AlertData) => void;
  onAssignAlert?: (alert: AlertData) => void;
}

export function AlertStream({
  alerts,
  selectedAlertId,
  onSelectAlert,
  onAssignAlert,
}: AlertStreamProps) {
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'Critical':
        return 'text-red-500 bg-red-500/10 border-red-500/50';
      case 'High':
        return 'text-orange-500 bg-orange-500/10 border-orange-500/50';
      case 'Medium':
        return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/50';
      default:
        return 'text-green-500 bg-green-500/10 border-green-500/50';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'Critical':
        return <ShieldAlert className="h-4 w-4" />;
      case 'High':
        return <AlertTriangle className="h-4 w-4" />;
      case 'Medium':
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <Info className="h-4 w-4" />;
    }
  };

  return (
    <div className="glass-panel flex h-full flex-col rounded-xl border border-slate-800 bg-slate-900 shadow-md">
      <div className="flex shrink-0 items-center justify-between border-b border-slate-800 p-4">
        <div>
          <h2 className="text-xl font-bold tracking-widest text-white">ALERT QUEUE</h2>
          <p className="text-xs text-slate-400">Generated detections with analyst actions</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="relative flex h-3 w-3">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-400 opacity-75" />
            <span className="relative inline-flex h-3 w-3 rounded-full bg-cyan-500" />
          </span>
          <span className="text-xs font-mono text-cyan-400">LIVE</span>
        </div>
      </div>

      <div className="flex-1 space-y-2 overflow-y-auto p-2">
        {alerts.map((alert) => {
          const isSelected = selectedAlertId === alert.id;

          return (
            <div
              key={alert.id}
              onClick={() => onSelectAlert(alert)}
              className={`cursor-pointer rounded-lg border p-3 transition-all hover:scale-[1.01] ${getSeverityColor(alert.severity)} ${
                isSelected ? 'ring-1 ring-cyan-400/50' : ''
              }`}
            >
              <div className="mb-2 flex items-start justify-between gap-3">
                <div className="flex items-center gap-2">
                  {getSeverityIcon(alert.severity)}
                  <span className="text-sm font-bold tracking-wider">{alert.attack_type.toUpperCase()}</span>
                </div>
                <span className="text-xs font-mono">
                  {new Date(alert.timestamp * 1000).toLocaleTimeString()}
                </span>
              </div>

              <div className="mb-2 flex flex-wrap gap-2 text-[10px] uppercase tracking-wider">
                <span className="rounded-full bg-black/20 px-2 py-1">{alert.queue_level}</span>
                <span className="rounded-full bg-black/20 px-2 py-1">{alert.status}</span>
                <span className="rounded-full bg-black/20 px-2 py-1">{alert.disposition.replace('_', ' ')}</span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                <div>
                  <span className="block text-[10px] uppercase text-slate-400">Source</span>
                  <span>{alert.source_ip}</span>
                </div>
                <div>
                  <span className="block text-[10px] uppercase text-slate-400">Destination</span>
                  <span>{alert.dest_ip}</span>
                </div>
              </div>

              <div className="mt-3 rounded-lg border border-current/15 bg-black/10 p-2 text-xs">
                <p className="text-slate-300">
                  Owner: {alert.assigned_analyst || 'Unassigned'}
                </p>
                <p className="mt-1 text-slate-400">
                  {alert.report_excerpt || `Ready for analyst review on ${alert.asset_name}.`}
                </p>
              </div>

              <div className="mt-3 flex flex-wrap items-center justify-between gap-3 border-t border-current/20 pt-3">
                <span className="text-[10px] font-semibold uppercase tracking-wider">
                  Node {alert.edge_node_id} | {(alert.confidence * 100).toFixed(1)}%
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={(event) => {
                      event.stopPropagation();
                      onSelectAlert(alert);
                    }}
                    className="rounded-lg bg-cyan-500/10 px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-cyan-200 hover:bg-cyan-500/20"
                  >
                    Investigate
                  </button>
                  {onAssignAlert && (
                    <button
                      onClick={(event) => {
                        event.stopPropagation();
                        onAssignAlert(alert);
                      }}
                      className="flex items-center gap-1 rounded-lg bg-emerald-500/10 px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-emerald-200 hover:bg-emerald-500/20"
                    >
                      <UserPlus className="h-3 w-3" />
                      Assign to Me
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
        {alerts.length === 0 && (
          <div className="flex h-full flex-col items-center justify-center gap-2 text-slate-500">
            <Info className="h-8 w-8 opacity-50" />
            <p className="text-sm font-medium">Waiting for edge node telemetry...</p>
          </div>
        )}
      </div>
    </div>
  );
}

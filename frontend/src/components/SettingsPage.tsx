import { CheckCheck, CloudCog, GlobeLock, PlugZap } from 'lucide-react';
import { API_BASE_URL, WS_BASE_URL } from '../lib/api';
import type { ConnectionState } from '../types';

interface SettingsPageProps {
  connectionState: ConnectionState;
  simulationActive: boolean;
}

const checklist = [
  'Set explicit production values for VITE_API_BASE_URL and VITE_WS_BASE_URL.',
  'Run backend behind a process manager such as Uvicorn with multiple workers or Gunicorn/Uvicorn.',
  'Restrict CORS origins to trusted frontend domains before public deployment.',
  'Terminate TLS at the ingress layer and forward WebSocket traffic to /ws.',
  'Store model credentials, API keys, and action hooks in environment variables or secret managers.',
];

export function SettingsPage({ connectionState, simulationActive }: SettingsPageProps) {
  return (
    <main className="flex-1 overflow-auto p-4 space-y-4">
      <section className="grid grid-cols-1 xl:grid-cols-12 gap-4">
        <div className="xl:col-span-7 glass-panel rounded-xl border border-slate-800 bg-slate-900 p-4">
          <div className="mb-4">
            <h2 className="text-lg font-bold text-white tracking-wide">Runtime Configuration</h2>
            <p className="text-xs text-slate-400 uppercase tracking-wider">Current client-facing endpoint posture</p>
          </div>

          <div className="space-y-3">
            <div className="rounded-lg border border-slate-800 bg-slate-950 p-3">
              <div className="flex items-center gap-2">
                <CloudCog className="w-4 h-4 text-cyan-400" />
                <span className="text-sm font-semibold text-white">REST API</span>
              </div>
              <p className="mt-2 font-mono text-sm text-slate-300">{API_BASE_URL}</p>
            </div>

            <div className="rounded-lg border border-slate-800 bg-slate-950 p-3">
              <div className="flex items-center gap-2">
                <PlugZap className="w-4 h-4 text-fuchsia-400" />
                <span className="text-sm font-semibold text-white">WebSocket Stream</span>
              </div>
              <p className="mt-2 font-mono text-sm text-slate-300">{WS_BASE_URL}</p>
            </div>

            <div className="rounded-lg border border-slate-800 bg-slate-950 p-3">
              <div className="flex items-center gap-2">
                <GlobeLock className="w-4 h-4 text-emerald-400" />
                <span className="text-sm font-semibold text-white">Operational State</span>
              </div>
              <p className="mt-2 text-sm text-slate-300">
                Control plane is <span className="font-semibold">{connectionState}</span> and simulation mode is{' '}
                <span className="font-semibold">{simulationActive ? 'active' : 'paused'}</span>.
              </p>
            </div>
          </div>
        </div>

        <div className="xl:col-span-5 glass-panel rounded-xl border border-slate-800 bg-slate-900 p-4">
          <div className="mb-4">
            <h2 className="text-lg font-bold text-white tracking-wide">Production Readiness</h2>
            <p className="text-xs text-slate-400 uppercase tracking-wider">Deployment checks before going live</p>
          </div>
          <div className="space-y-3">
            {checklist.map((item) => (
              <div key={item} className="rounded-lg border border-slate-800 bg-slate-950 p-3 flex gap-3">
                <CheckCheck className="mt-0.5 w-4 h-4 text-cyan-400 shrink-0" />
                <p className="text-sm text-slate-300">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

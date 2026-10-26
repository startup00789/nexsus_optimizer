import React, { useEffect, useRef } from 'react';
import { Terminal, ChevronDown, ChevronUp, Trash2 } from 'lucide-react';
import type { LogEntry } from '../types/nexus.ts';

interface ActionConsoleDrawerProps {
  logs: LogEntry[];
  expanded: boolean;
  onToggleExpand: () => void;
  filter: 'ALL' | LogEntry['subsystem'];
  onChangeFilter: (filter: 'ALL' | LogEntry['subsystem']) => void;
  onClearLogs: () => void;
}

const SUBSYSTEM_FILTERS: Array<'ALL' | LogEntry['subsystem']> = [
  'ALL',
  'DWM',
  'ETW',
  'MEM',
  'CPU',
  'GPU',
  'PROFILE',
];

export const ActionConsoleDrawer: React.FC<ActionConsoleDrawerProps> = ({
  logs,
  expanded,
  onToggleExpand,
  filter,
  onChangeFilter,
  onClearLogs,
}) => {
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const filteredLogs = filter === 'ALL' ? logs : logs.filter((item) => item.subsystem === filter);
  const latestLog = logs[logs.length - 1];

  useEffect(() => {
    if (expanded && scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
    }
  }, [expanded, filteredLogs.length]);

  const getSeverityColor = (severity: LogEntry['severity']) => {
    switch (severity) {
      case 'SUCCESS':
        return 'text-[#00FFA3]';
      case 'WARNING':
        return 'text-[#F59E0B]';
      case 'CRITICAL':
        return 'text-[#EF4444]';
      default:
        return 'text-[#00F2FE]';
    }
  };

  return (
    <footer
      aria-label="Live Action Console Drawer"
      className="rounded-xl bg-[#111827] border border-[#1F293D] overflow-hidden"
    >
      {/* Drawer Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 bg-[#0B0F19]/80 border-b border-[#1F293D]">
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            onClick={onToggleExpand}
            className="inline-flex items-center gap-2 text-xs font-display font-bold uppercase tracking-wider text-[#F8FAFC] hover:text-[#00F2FE] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Terminal className="w-3.5 h-3.5 text-[#00F2FE]" />
            <span>Live Action Console ({filteredLogs.length})</span>
            {expanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
          </button>

          {!expanded && latestLog ? (
            <span className="text-xs font-mono text-[#94A3B8] truncate">
              [{latestLog.timestamp}] {latestLog.message}
            </span>
          ) : null}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <div className="hidden sm:flex items-center gap-1" role="group" aria-label="Filter Console Logs">
            {SUBSYSTEM_FILTERS.map((sub) => (
              <button
                key={sub}
                type="button"
                onClick={() => onChangeFilter(sub)}
                className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold transition-colors cursor-pointer ${
                  filter === sub
                    ? 'bg-[#00F2FE]/20 text-[#00F2FE] border border-[#00F2FE]/40'
                    : 'text-[#94A3B8] hover:text-[#F8FAFC]'
                }`}
              >
                {sub}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={onClearLogs}
            aria-label="Clear Console Logs"
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-mono text-[#94A3B8] hover:text-[#F8FAFC] bg-[#161F30] border border-[#1F293D] transition-colors cursor-pointer"
          >
            <Trash2 className="w-3 h-3" />
            <span>Clear</span>
          </button>
        </div>
      </div>

      {/* Collapsible Terminal Output Body */}
      {expanded && (
        <div
          ref={scrollContainerRef}
          data-testid="action-console-logs"
          className="max-h-44 overflow-y-auto p-3.5 bg-[#0B0F19] font-mono text-xs space-y-1.5"
        >
          {filteredLogs.length === 0 ? (
            <div className="text-[#94A3B8] py-2">
              No operation events recorded for subsystem [{filter}]. Trigger any optimization preset to inspect live IPC logs.
            </div>
          ) : (
            filteredLogs.map((entry) => (
              <div key={entry.id} className="flex items-start gap-2 leading-relaxed">
                <span className="text-[#94A3B8] shrink-0">[{entry.timestamp}]</span>
                <span className={`font-semibold shrink-0 w-16 ${getSeverityColor(entry.severity)}`}>
                  [{entry.subsystem}]
                </span>
                <span className="text-[#F8FAFC] break-words">{entry.message}</span>
              </div>
            ))
          )}
        </div>
      )}
    </footer>
  );
};

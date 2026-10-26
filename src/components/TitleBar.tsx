import React from 'react';
import { Minus, Square, X, ShieldCheck, Monitor } from 'lucide-react';
import type { DpiScaleMode } from '../types/nexus.ts';

interface TitleBarProps {
  dpiScale: DpiScaleMode;
  onChangeDpiScale: (scale: DpiScaleMode) => void;
  isMinimized: boolean;
  onToggleMinimize: () => void;
  isMaximized: boolean;
  onToggleMaximize: () => void;
  onResetWorkspace: () => void;
}

const DPI_MODES: DpiScaleMode[] = ['100%', '125%', '150%', '4K'];

export const TitleBar: React.FC<TitleBarProps> = ({
  dpiScale,
  onChangeDpiScale,
  isMinimized,
  onToggleMinimize,
  isMaximized,
  onToggleMaximize,
  onResetWorkspace,
}) => {
  return (
    <header className="sticky top-0 z-40 flex items-center justify-between gap-4 px-4 py-2 bg-[#0B0F19]/95 backdrop-blur-md border-b border-[#1F293D] select-none">
      {/* Zone 1: Window Identity */}
      <div className="flex items-center gap-3 min-w-0">
        <div className="flex items-center justify-center w-6 h-6 rounded bg-[#00F2FE]/10 border border-[#00F2FE]/40 text-[#00F2FE]">
          <ShieldCheck className="w-3.5 h-3.5" />
        </div>
        <span className="font-display text-sm font-bold tracking-wider text-[#F8FAFC] whitespace-nowrap shrink-0">
          NEXUS OPTIMIZER
        </span>
        <span className="hidden sm:inline text-xs text-[#94A3B8] font-mono whitespace-nowrap shrink-0">
          · MAX EDITION v4.2 · RING-0 TELEMETRY BRIDGE
        </span>
      </div>

      {/* Zone 2: Quick Section Jump Links */}
      <nav aria-label="Workspace Sections" className="hidden lg:flex items-center gap-6 text-xs font-medium text-[#94A3B8]">
        <a href="#telemetry-ribbon" className="hover:text-[#00F2FE] transition-colors whitespace-nowrap shrink-0">
          Telemetry Ribbon
        </a>
        <a href="#frame-oscilloscope" className="hover:text-[#00F2FE] transition-colors whitespace-nowrap shrink-0">
          Frame Oscilloscope
        </a>
        <a href="#game-boosters" className="hover:text-[#00F2FE] transition-colors whitespace-nowrap shrink-0">
          Game Boosters
        </a>
        <a href="#deep-control" className="hover:text-[#00F2FE] transition-colors whitespace-nowrap shrink-0">
          Control Center
        </a>
      </nav>

      {/* Zone 3: Per-Monitor V2 DPI Scaling & Borderless Window Controls */}
      <div className="flex items-center gap-3 shrink-0">
        <div className="hidden md:flex items-center gap-1.5 text-xs text-[#94A3B8] font-mono">
          <Monitor className="w-3.5 h-3.5 text-[#00F2FE]" />
          <span className="whitespace-nowrap">DPI V2:</span>
          <div className="flex items-center bg-[#111827] border border-[#1F293D] rounded p-0.5" role="group" aria-label="DPI Scaling Mode">
            {DPI_MODES.map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => onChangeDpiScale(mode)}
                className={`px-1.5 py-0.5 text-[11px] font-mono rounded transition-colors whitespace-nowrap ${
                  dpiScale === mode
                    ? 'bg-[#00F2FE]/20 text-[#00F2FE] font-semibold'
                    : 'text-[#94A3B8] hover:text-[#F8FAFC]'
                }`}
              >
                {mode}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-1 pl-2 border-l border-[#1F293D]">
          <button
            type="button"
            onClick={onToggleMinimize}
            aria-label={isMinimized ? 'Restore Compact View' : 'Minimize to Telemetry Ribbon'}
            title={isMinimized ? 'Restore Full Dashboard' : 'Compact Telemetry Mode'}
            className="flex items-center justify-center w-7 h-7 rounded text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-[#161F30] transition-colors"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={onToggleMaximize}
            aria-label={isMaximized ? 'Restore Window Width' : 'Maximize Workspace Width'}
            title={isMaximized ? 'Standard Container Width' : 'Full Bleed 4K Workspace'}
            className="flex items-center justify-center w-7 h-7 rounded text-[#94A3B8] hover:text-[#00F2FE] hover:bg-[#161F30] transition-colors"
          >
            <Square className="w-3 h-3" />
          </button>
          <button
            type="button"
            onClick={onResetWorkspace}
            aria-label="Reset Telemetry State"
            title="Reset Default Telemetry State"
            className="flex items-center justify-center w-7 h-7 rounded text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-[#EF4444] hover:shadow-[0_0_12px_rgba(239,68,68,0.65)] transition-all"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </header>
  );
};

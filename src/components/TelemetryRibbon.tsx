import React from 'react';
import { Zap, AlertTriangle, CheckCircle2, Rocket } from 'lucide-react';
import type { SystemTelemetryState } from '../types/nexus.ts';

interface TelemetryRibbonProps {
  telemetry: SystemTelemetryState;
  busyAction: string | null;
  onFixDwmCrisis: () => void;
  onSimulateDwmCrisis: () => void;
  onEngage300FpsOverdrive: () => void;
  onSetTargetFpsCap: (fps: number) => void;
}

export const TelemetryRibbon: React.FC<TelemetryRibbonProps> = ({
  telemetry,
  busyAction,
  onFixDwmCrisis,
  onSimulateDwmCrisis,
  onEngage300FpsOverdrive,
  onSetTargetFpsCap,
}) => {
  const isCrisis = telemetry.dwmCrisisMode;
  const isFixing = busyAction === 'dwm-fix';

  const thermalColor =
    telemetry.thermalStatus === 'CRITICAL'
      ? 'text-[#EF4444]'
      : telemetry.thermalStatus === 'ELEVATED'
      ? 'text-[#F59E0B]'
      : 'text-[#00FFA3]';

  const thermalBarColor =
    telemetry.thermalStatus === 'CRITICAL'
      ? 'bg-[#EF4444]'
      : telemetry.thermalStatus === 'ELEVATED'
      ? 'bg-[#F59E0B]'
      : 'bg-[#00FFA3]';

  return (
    <section id="telemetry-ribbon" aria-label="Real-Time Hardware Telemetry Ribbon" className="space-y-4">
      {/* Top Status & Emergency DWM Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 p-4 rounded-xl bg-[#111827] border border-[#1F293D]">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="font-display text-lg sm:text-xl font-bold tracking-wide text-[#F8FAFC]">
              NEXUS OPTIMIZER — MAX EDITION
            </h1>
            <span className="text-xs font-mono text-[#94A3B8]">·</span>
            <span
              className={`inline-flex items-center gap-1.5 text-xs font-mono font-semibold ${
                isCrisis ? 'text-[#EF4444]' : 'text-[#00FFA3]'
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  isCrisis
                    ? 'bg-[#EF4444] shadow-[0_0_8px_#EF4444]'
                    : 'bg-[#00FFA3] shadow-[0_0_8px_#00FFA3]'
                }`}
              />
              {isCrisis ? 'DWM BOTTLENECK DETECTED (20 FPS LOCK)' : 'ONLINE · DIRECTFLIP ACTIVE'}
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-2 pt-0.5 text-xs text-[#94A3B8] font-mono">
            <span>PresentMon ETW: <strong className="text-[#F8FAFC]">{telemetry.presentMode}</strong></span>
            <span>·</span>
            <span className="flex flex-wrap items-center gap-1">
              <span>Pacing Cap:</span>
              {[112, 144, 240, 300, 360, 1000].map((fpsVal) => (
                <button
                  key={fpsVal}
                  type="button"
                  onClick={() => onSetTargetFpsCap(fpsVal)}
                  className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold transition-all cursor-pointer ${
                    telemetry.targetFpsCap === fpsVal
                      ? 'bg-[#00F2FE] text-[#0B0F19] font-bold shadow-[0_0_8px_rgba(0,242,254,0.4)]'
                      : 'bg-[#161F30] text-[#94A3B8] hover:text-[#F8FAFC] border border-[#1F293D]'
                  }`}
                >
                  {fpsVal === 1000 ? 'UNCAPPED' : `${fpsVal} FPS`}
                </button>
              ))}
            </span>
          </div>
        </div>

        {/* Emergency DWM Crisis Button + 300+ FPS Boost Button + Test Trigger */}
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={onEngage300FpsOverdrive}
            disabled={busyAction === 'boost-300'}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-display font-bold tracking-wider uppercase bg-[#00F2FE] text-[#0B0F19] shadow-[0_0_20px_rgba(0,242,254,0.45)] hover:bg-[#38BDF8] transition-all whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Rocket className="w-4 h-4 shrink-0" />
            <span>{busyAction === 'boost-300' ? 'ENGAGING 300+ FPS...' : '⚡ BOOST TO 300+ FPS'}</span>
          </button>

          {!isCrisis ? (
            <button
              type="button"
              onClick={onSimulateDwmCrisis}
              className="px-3 py-2 rounded-lg text-xs font-mono text-[#94A3B8] hover:text-[#F59E0B] bg-[#161F30] hover:bg-[#1F293D] border border-[#1F293D] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              Simulate 20 FPS Crisis
            </button>
          ) : null}

          <button
            type="button"
            onClick={onFixDwmCrisis}
            disabled={isFixing}
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-display font-bold tracking-wider uppercase transition-all whitespace-nowrap shrink-0 cursor-pointer ${
              isCrisis
                ? 'bg-[#F59E0B] text-[#0B0F19] shadow-[0_0_20px_rgba(245,158,11,0.55)] hover:bg-[#FBBF24]'
                : 'bg-[#F59E0B]/15 text-[#F59E0B] border border-[#F59E0B]/50 shadow-[0_0_15px_rgba(245,158,11,0.2)] hover:bg-[#F59E0B] hover:text-[#0B0F19]'
            }`}
          >
            <Zap className="w-4 h-4 shrink-0" />
            <span>{isFixing ? 'UNLOCKING SWAPCHAIN...' : 'FIX 20 FPS CRISIS (DWM UNLOCK)'}</span>
          </button>
        </div>
      </div>

      {/* 5 Real-Time Metric Telemetry Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-3.5">
        {/* Card 1: CPU Package */}
        <div className="p-4 rounded-xl bg-[#111827] border border-[#1F293D] flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between text-xs text-[#94A3B8]">
            <span className="font-display font-semibold tracking-wider uppercase text-[#F8FAFC]">
              01 · CPU Package
            </span>
            <span className="font-mono text-[#00F2FE]">{telemetry.cpuPackageWatts.toFixed(1)} W</span>
          </div>

          <div className="flex items-baseline justify-between">
            <div>
              <span className="text-2xl font-mono font-bold text-[#F8FAFC] tabular-nums">
                {telemetry.cpuUsagePercent}
              </span>
              <span className="text-xs font-mono text-[#94A3B8] ml-1">% LOAD</span>
            </div>
            <div className="text-right font-mono text-[11px] text-[#94A3B8] space-y-0.5">
              <div>
                P-Core: <span className="text-[#00F2FE] font-semibold">{telemetry.pCoreClockMhz} MHz</span>
              </div>
              <div>
                E-Core: <span className="text-[#F8FAFC]">{telemetry.eCoreClockMhz} MHz</span>
              </div>
            </div>
          </div>

          <div className="w-full h-1.5 bg-[#161F30] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#00F2FE] transition-all duration-200"
              style={{ width: `${Math.min(100, telemetry.cpuUsagePercent)}%` }}
            />
          </div>
        </div>

        {/* Card 2: Memory (RAM) */}
        <div className="p-4 rounded-xl bg-[#111827] border border-[#1F293D] flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between text-xs text-[#94A3B8]">
            <span className="font-display font-semibold tracking-wider uppercase text-[#F8FAFC]">
              02 · Memory (RAM)
            </span>
            <span className="font-mono text-[#00FFA3]">{telemetry.ramUsedPercent.toFixed(1)}% USED</span>
          </div>

          <div className="flex items-baseline justify-between">
            <div>
              <span className="text-2xl font-mono font-bold text-[#F8FAFC] tabular-nums">
                {telemetry.ramAvailableGb.toFixed(1)}
              </span>
              <span className="text-xs font-mono text-[#94A3B8] ml-1">GB FREE</span>
            </div>
            <div className="text-right font-mono text-[11px] text-[#94A3B8] space-y-0.5">
              <div>
                Used: <span className="text-[#F8FAFC]">{telemetry.ramUsedGb.toFixed(1)} GB</span>
              </div>
              <div>
                Total: <span className="text-[#94A3B8]">{telemetry.ramTotalGb.toFixed(0)} GB DDR5</span>
              </div>
            </div>
          </div>

          <div className="w-full h-1.5 bg-[#161F30] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#00FFA3] transition-all duration-200"
              style={{ width: `${Math.min(100, telemetry.ramUsedPercent)}%` }}
            />
          </div>
        </div>

        {/* Card 3: Thermals & Clocks */}
        <div className="p-4 rounded-xl bg-[#111827] border border-[#1F293D] flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between text-xs text-[#94A3B8]">
            <span className="font-display font-semibold tracking-wider uppercase text-[#F8FAFC]">
              03 · Thermals & Clocks
            </span>
            <span className={`font-mono font-semibold ${thermalColor}`}>
              ● {telemetry.thermalStatus}
            </span>
          </div>

          <div className="flex items-baseline justify-between gap-2">
            <div className="whitespace-nowrap">
              <span className="text-2xl font-mono font-bold text-[#F8FAFC] tabular-nums">
                {telemetry.cpuTempC}°C
              </span>
              <span className="text-[11px] font-mono text-[#94A3B8] ml-1">CPU</span>
              <span className="text-[#1F293D] mx-1">/</span>
              <span className="text-lg font-mono font-semibold text-[#F8FAFC] tabular-nums">
                {telemetry.gpuTempC}°C
              </span>
              <span className="text-[11px] font-mono text-[#94A3B8] ml-1">GPU</span>
            </div>
            <div className="text-right font-mono text-[11px] text-[#94A3B8] whitespace-nowrap shrink-0">
              <div>
                GPU: <span className="text-[#00F2FE] font-semibold">{telemetry.gpuClockMhz} MHz</span>
              </div>
            </div>
          </div>

          <div className="w-full h-1.5 bg-[#161F30] rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-200 ${thermalBarColor}`}
              style={{ width: `${Math.min(100, Math.max(telemetry.cpuTempC, telemetry.gpuTempC))}%` }}
            />
          </div>
        </div>

        {/* Card 4: Displayed FPS (PresentMon ETW) */}
        <div
          className={`p-4 rounded-xl bg-[#111827] border flex flex-col justify-between space-y-3 transition-colors ${
            isCrisis ? 'border-[#EF4444]/80' : 'border-[#1F293D]'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-[#94A3B8]">
            <span className="font-display font-semibold tracking-wider uppercase text-[#F8FAFC]">
              04 · Displayed FPS
            </span>
            <span className="font-mono text-[11px] text-[#00F2FE]">PresentMon ETW</span>
          </div>

          <div className="flex items-baseline justify-between gap-2">
            <div className="whitespace-nowrap">
              <span
                data-testid="displayed-fps-value"
                className={`text-2xl font-mono font-bold tabular-nums ${
                  isCrisis ? 'text-[#EF4444]' : 'text-[#00FFA3]'
                }`}
              >
                {telemetry.displayedFps}
              </span>
              <span className="text-xs font-mono text-[#94A3B8] ml-1">FPS</span>
            </div>
            <div className="text-right font-mono text-[11px] text-[#94A3B8] space-y-0.5 whitespace-nowrap shrink-0">
              <div>
                1% Low:{' '}
                <span className={isCrisis ? 'text-[#EF4444] font-semibold' : 'text-[#00F2FE] font-semibold'}>
                  {telemetry.onePercentLowFps} FPS
                </span>
              </div>
              <div>
                Stability:{' '}
                <span className="text-[#F8FAFC]">
                  {Math.round((telemetry.onePercentLowFps / Math.max(1, telemetry.displayedFps)) * 100)}%
                </span>
              </div>
            </div>
          </div>

          <div className="w-full h-1.5 bg-[#161F30] rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-200 ${
                isCrisis ? 'bg-[#EF4444]' : 'bg-[#00FFA3]'
              }`}
              style={{ width: `${Math.min(100, (telemetry.displayedFps / 320) * 100)}%` }}
            />
          </div>
        </div>

        {/* Card 5: Frame & Latency */}
        <div
          className={`p-4 rounded-xl bg-[#111827] border flex flex-col justify-between space-y-3 transition-colors ${
            isCrisis ? 'border-[#EF4444]/80' : 'border-[#1F293D]'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-[#94A3B8]">
            <span className="font-display font-semibold tracking-wider uppercase text-[#F8FAFC]">
              05 · Frame & Latency
            </span>
            {isCrisis ? (
              <span className="inline-flex items-center gap-1 font-mono text-[11px] text-[#EF4444]">
                <AlertTriangle className="w-3 h-3" /> STUTTER
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 font-mono text-[11px] text-[#00FFA3]">
                <CheckCircle2 className="w-3 h-3" /> LOCKED
              </span>
            )}
          </div>

          <div className="flex items-baseline justify-between gap-2">
            <div className="whitespace-nowrap">
              <span className="text-2xl font-mono font-bold text-[#F8FAFC] tabular-nums">
                {telemetry.frameTimeMs.toFixed(2)}
              </span>
              <span className="text-xs font-mono text-[#94A3B8] ml-1">ms</span>
            </div>
            <div className="text-right font-mono text-[11px] text-[#94A3B8] space-y-0.5 whitespace-nowrap shrink-0">
              <div>
                Photon:{' '}
                <span className={isCrisis ? 'text-[#EF4444] font-semibold' : 'text-[#00F2FE] font-semibold'}>
                  {telemetry.clickToPhotonMs.toFixed(2)} ms
                </span>
              </div>
              <div>Swapchain: 0-Copy</div>
            </div>
          </div>

          <div className="w-full h-1.5 bg-[#161F30] rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-200 ${
                isCrisis ? 'bg-[#EF4444]' : 'bg-[#00F2FE]'
              }`}
              style={{ width: `${Math.min(100, Math.max(12, 100 - telemetry.frameTimeMs * 2))}%` }}
            />
          </div>
        </div>
      </div>
    </section>
  );
};

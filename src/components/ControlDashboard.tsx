import React, { useEffect, useRef, useState } from 'react';
import {
  HardDrive,
  Sparkles,
  Cpu,
  Gauge,
  TerminalSquare,
  Trash2,
  Sliders,
  ShieldAlert,
  Send,
  CheckCircle2,
  Fan,
} from 'lucide-react';
import type {
  AdvisorMessage,
  CoreTelemetry,
  DashboardTabId,
  ProcessAffinityItem,
  SensorTelemetryState,
  StorageCacheState,
  SystemTelemetryState,
  UpscalerConfig,
  UpscalerShaderId,
} from '../types/nexus.ts';
import { formatAffinityBitmask, getUpscalerMetrics } from '../utils/nexusEngine.ts';

interface ControlDashboardProps {
  activeTab: DashboardTabId;
  onSelectTab: (tab: DashboardTabId) => void;
  telemetry: SystemTelemetryState;
  storage: StorageCacheState;
  upscaler: UpscalerConfig;
  cores: CoreTelemetry[];
  processes: ProcessAffinityItem[];
  sensors: SensorTelemetryState;
  advisorMessages: AdvisorMessage[];
  busyAction: string | null;
  onPurgeStandbyMemory: () => void;
  onUpdateUpscaler: (patch: Partial<UpscalerConfig>) => void;
  onToggleProcessCore: (pid: number, coreId: number) => void;
  onPinGamesToPCores: () => void;
  onSetFanProfile: (profile: SensorTelemetryState['fanProfile']) => void;
  onSendAdvisorPrompt: (prompt: string) => void;
  onFixDwmCrisis: () => void;
  onEngage300FpsOverdrive: () => void;
}

const TABS: Array<{ id: DashboardTabId; label: string; shortLabel: string; icon: React.ReactNode }> = [
  {
    id: 'storage-memory',
    label: '01 · 5TB Virtual Storage & Memory',
    shortLabel: 'Storage & RAM',
    icon: <HardDrive className="w-3.5 h-3.5" />,
  },
  {
    id: 'spatial-upscaler',
    label: '02 · AI Spatial Upscaler & Frame Gen',
    shortLabel: 'Spatial Upscaler',
    icon: <Sparkles className="w-3.5 h-3.5" />,
  },
  {
    id: 'process-affinity',
    label: '03 · Process Sandbox & CPU Affinity',
    shortLabel: 'CPU Affinity',
    icon: <Cpu className="w-3.5 h-3.5" />,
  },
  {
    id: 'sensor-telemetry',
    label: '04 · Real-Time Sensor Telemetry',
    shortLabel: 'Sensor Gauges',
    icon: <Gauge className="w-3.5 h-3.5" />,
  },
  {
    id: 'engine-advisor',
    label: '05 · AI Engine Advisor',
    shortLabel: 'Engine Advisor',
    icon: <TerminalSquare className="w-3.5 h-3.5" />,
  },
];

export const ControlDashboard: React.FC<ControlDashboardProps> = ({
  activeTab,
  onSelectTab,
  telemetry,
  storage,
  upscaler,
  cores,
  processes,
  sensors,
  advisorMessages,
  busyAction,
  onPurgeStandbyMemory,
  onUpdateUpscaler,
  onToggleProcessCore,
  onPinGamesToPCores,
  onSetFanProfile,
  onSendAdvisorPrompt,
  onFixDwmCrisis,
}) => {
  const [advisorInput, setAdvisorInput] = useState('');
  const upscalerCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const advisorStreamRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (activeTab === 'engine-advisor' && advisorStreamRef.current) {
      advisorStreamRef.current.scrollTop = advisorStreamRef.current.scrollHeight;
    }
  }, [activeTab, advisorMessages]);

  // Render interactive Before/After Spatial Upscaler Comparison Canvas when Tab 2 is active
  useEffect(() => {
    if (activeTab !== 'spatial-upscaler') return;
    const canvas = upscalerCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = typeof window !== 'undefined' ? Math.min(window.devicePixelRatio || 1, 2) : 1;
    const rect = canvas.getBoundingClientRect();
    const width = rect.width || 640;
    const height = rect.height || 260;

    if (canvas.width !== width * dpr || canvas.height !== height * dpr) {
      canvas.width = width * dpr;
      canvas.height = height * dpr;
    }

    ctx.save();
    ctx.scale(dpr, dpr);

    const splitX = (upscaler.previewSplitPercent / 100) * width;

    // Helper to draw a synthetic tactical cyber arena viewport (either soft/pixelated raw 720p or crisp RCAS/ACNet upscaled)
    const drawScene = (isUpscaled: boolean) => {
      // Sky & cyber horizon gradient
      const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
      bgGrad.addColorStop(0, '#070B14');
      bgGrad.addColorStop(0.55, '#0F1A2E');
      bgGrad.addColorStop(1, '#090D16');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      const horizonY = height * 0.56;

      // Perspective floor grid
      ctx.strokeStyle = isUpscaled ? 'rgba(0, 242, 254, 0.48)' : 'rgba(0, 242, 254, 0.18)';
      ctx.lineWidth = isUpscaled ? 1.2 : 2.8;
      for (let i = -8; i <= 8; i++) {
        ctx.beginPath();
        ctx.moveTo(width / 2 + i * 18, horizonY);
        ctx.lineTo(width / 2 + i * 95, height);
        ctx.stroke();
      }
      for (let r = 1; r <= 5; r++) {
        const y = horizonY + Math.pow(r / 5, 1.6) * (height - horizonY);
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Tactical architectural pillars & target geometry
      const pillars = [
        { x: width * 0.18, y: horizonY - 70, w: 46, h: 95 },
        { x: width * 0.34, y: horizonY - 52, w: 38, h: 72 },
        { x: width * 0.62, y: horizonY - 64, w: 44, h: 86 },
        { x: width * 0.78, y: horizonY - 80, w: 50, h: 105 },
      ];

      pillars.forEach((p, idx) => {
        ctx.fillStyle = isUpscaled ? '#162238' : '#131C2E';
        ctx.fillRect(p.x, p.y, p.w, p.h);
        ctx.strokeStyle =
          isUpscaled
            ? upscaler.shader === 'MAGPIE_ACNET'
              ? '#00FFA3'
              : '#00F2FE'
            : 'rgba(148, 163, 184, 0.25)';
        ctx.lineWidth = isUpscaled ? 1.5 : 3;
        ctx.strokeRect(p.x, p.y, p.w, p.h);

        // Sub-pixel edge detail only visible cleanly in upscaled mode
        if (isUpscaled) {
          ctx.fillStyle = idx % 2 === 0 ? '#00F2FE' : '#00FFA3';
          ctx.fillRect(p.x + 6, p.y + 8, p.w - 12, 2);
          ctx.fillRect(p.x + 6, p.y + 16, (p.w - 12) * 0.6, 2);
        } else {
          // Simulated low-res stair-stepping blockiness
          ctx.fillStyle = 'rgba(148, 163, 184, 0.22)';
          ctx.fillRect(p.x + 4, p.y + 6, p.w - 8, 6);
        }
      });

      // Center Reticle Target
      const cx = width * 0.5;
      const cy = horizonY - 12;
      ctx.strokeStyle = isUpscaled ? '#00FFA3' : 'rgba(245, 158, 11, 0.45)';
      ctx.lineWidth = isUpscaled ? 1.5 : 3.5;
      ctx.beginPath();
      ctx.arc(cx, cy, 26, 0, Math.PI * 2);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(cx - 36, cy);
      ctx.lineTo(cx + 36, cy);
      ctx.moveTo(cx, cy - 36);
      ctx.lineTo(cx, cy + 36);
      ctx.stroke();
    };

    // Draw Left Side: Native Low-Res 720p Unfiltered
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, 0, splitX, height);
    ctx.clip();
    drawScene(false);
    ctx.fillStyle = 'rgba(11, 15, 25, 0.78)';
    ctx.fillRect(12, 12, 195, 24);
    ctx.fillStyle = '#94A3B8';
    ctx.font = '600 11px "JetBrains Mono", monospace';
    ctx.fillText(`RAW ${upscaler.inputResolution} (BILINEAR)`, 20, 28);
    ctx.restore();

    // Draw Right Side: AI Spatial Upscaled + RCAS Sharpened
    ctx.save();
    ctx.beginPath();
    ctx.rect(splitX, 0, width - splitX, height);
    ctx.clip();
    drawScene(true);
    const badgeW = 248;
    ctx.fillStyle = 'rgba(11, 15, 25, 0.84)';
    ctx.fillRect(width - badgeW - 12, 12, badgeW, 24);
    ctx.fillStyle = '#00FFA3';
    ctx.font = '600 11px "JetBrains Mono", monospace';
    ctx.fillText(
      `${upscaler.shader} -> ${upscaler.outputResolution} (${upscaler.sharpness}%)`,
      width - badgeW - 4,
      28
    );
    ctx.restore();

    // Split Divider Bar & Handle
    ctx.strokeStyle = '#00F2FE';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(splitX, 0);
    ctx.lineTo(splitX, height);
    ctx.stroke();

    ctx.fillStyle = '#00F2FE';
    ctx.beginPath();
    ctx.arc(splitX, height / 2, 11, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#0B0F19';
    ctx.font = '700 10px "JetBrains Mono", monospace';
    ctx.fillText('<>', splitX - 6, height / 2 + 3.5);

    ctx.restore();
  }, [activeTab, upscaler]);

  const upscalerMetrics = getUpscalerMetrics(upscaler);

  const handleAdvisorSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!advisorInput.trim()) return;
    onSendAdvisorPrompt(advisorInput);
    setAdvisorInput('');
  };

  const executeAdvisorAction = (
    actionType: NonNullable<AdvisorMessage['recommendedAction']>['actionType']
  ) => {
    if (actionType === 'UNLOCK_DWM') {
      onFixDwmCrisis();
    } else if (actionType === 'PURGE_RAM') {
      onPurgeStandbyMemory();
    } else if (actionType === 'PIN_PCORES') {
      onPinGamesToPCores();
    } else if (actionType === 'APPLY_RCAS') {
      onUpdateUpscaler({ shader: 'AMD_RCAS', sharpness: 82, directFlipActive: true });
    } else if (actionType === 'BOOST_300_FPS') {
      onEngage300FpsOverdrive();
    }
  };

  // Ring buffer calculations for Tab 1
  const ringRatio = storage.pinnedRamCacheUsedGb / storage.pinnedRamCacheTotalGb;
  const ringRadius = 58;
  const ringCircumference = 2 * Math.PI * ringRadius;
  const ringStrokeDashoffset = ringCircumference * (1 - ringRatio);

  return (
    <section
      id="deep-control"
      aria-label="Tabbed Deep Control Dashboard"
      className="rounded-xl bg-[#111827] border border-[#1F293D] overflow-hidden"
    >
      {/* Segmented Tab Bar */}
      <div
        role="tablist"
        aria-label="Deep Control Modules"
        className="flex items-center gap-1 p-2 bg-[#0B0F19]/60 border-b border-[#1F293D] overflow-x-auto"
      >
        {TABS.map((tab) => {
          const isSelected = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={isSelected}
              onClick={() => onSelectTab(tab.id)}
              className={`flex items-center gap-2 px-3.5 py-2.5 rounded-lg text-xs font-display font-semibold tracking-wide transition-all whitespace-nowrap shrink-0 cursor-pointer ${
                isSelected
                  ? 'bg-[#161F30] text-[#00F2FE] border border-[#00F2FE]/40 shadow-[0_0_12px_rgba(0,242,254,0.15)]'
                  : 'text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-[#161F30]/50 border border-transparent'
              }`}
            >
              {tab.icon}
              <span className="hidden md:inline">{tab.label}</span>
              <span className="md:hidden">{tab.shortLabel}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Content Viewport */}
      <div className="p-5">
        {/* TAB 1: 5TB Virtual Storage & Memory */}
        {activeTab === 'storage-memory' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            {/* Left Column: 20GB Pinned RAM Cache Ring Buffer Visualizer */}
            <div className="lg:col-span-5 flex flex-col sm:flex-row items-center gap-6 p-4 rounded-xl bg-[#161F30]/60 border border-[#1F293D]">
              <div className="relative w-36 h-36 flex items-center justify-center shrink-0">
                <svg className="w-36 h-36 -rotate-90" viewBox="0 0 140 140">
                  <circle
                    cx="70"
                    cy="70"
                    r={ringRadius}
                    stroke="#1F293D"
                    strokeWidth="10"
                    fill="transparent"
                  />
                  <circle
                    cx="70"
                    cy="70"
                    r={ringRadius}
                    stroke="#00F2FE"
                    strokeWidth="10"
                    strokeDasharray={ringCircumference}
                    strokeDashoffset={ringStrokeDashoffset}
                    strokeLinecap="round"
                    fill="transparent"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="text-xl font-mono font-bold text-[#F8FAFC] tabular-nums">
                    {storage.pinnedRamCacheUsedGb.toFixed(1)}
                  </span>
                  <span className="text-[10px] font-mono text-[#94A3B8]">
                    / {storage.pinnedRamCacheTotalGb.toFixed(0)} GB PINNED
                  </span>
                  <span className="text-[11px] font-mono text-[#00FFA3] font-semibold mt-0.5">
                    {storage.ringBufferHitRatePercent}% HIT
                  </span>
                </div>
              </div>

              <div className="space-y-2.5 text-xs">
                <h3 className="font-display text-sm font-bold uppercase tracking-wider text-[#F8FAFC]">
                  20GB Pinned RAM Ring Buffer
                </h3>
                <p className="text-[#94A3B8] leading-relaxed">
                  Zero-latency L2 circular block cache pinned in non-paged physical RAM. Eliminates NVMe shader & texture streaming stalls.
                </p>
                <div className="pt-1 font-mono text-[11px] text-[#94A3B8] space-y-1">
                  <div>
                    Virtual Pool: <span className="text-[#F8FAFC]">{storage.virtualPoolAllocatedTb} TB</span> /{' '}
                    {storage.virtualPoolTotalTb.toFixed(1)} TB
                  </div>
                  <div>
                    Ring Topology: <span className="text-[#00F2FE]">Lock-Free FIFO (64KB Stride)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: WOF Compression Meter & Standby Memory Purge */}
            <div className="lg:col-span-7 space-y-5">
              {/* WOF Compression Savings Meter */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-display font-bold uppercase tracking-wider text-[#F8FAFC]">
                    Windows Overlay Filter (WOF) XPRESS16K Compression
                  </span>
                  <span className="font-mono text-[#00FFA3] font-semibold">
                    {storage.wofCompressionRatio}x Ratio · {storage.wofSpaceSavedGb} GB Saved
                  </span>
                </div>
                <div className="w-full h-2.5 bg-[#0B0F19] rounded-full overflow-hidden border border-[#1F293D]">
                  <div
                    className="h-full bg-gradient-to-r from-[#00F2FE] to-[#00FFA3]"
                    style={{ width: '68%' }}
                  />
                </div>
                <div className="flex items-center justify-between text-[11px] font-mono text-[#94A3B8]">
                  <span>Uncompressed Game Assets: 985.4 GB</span>
                  <span>Physical Footprint: 572.8 GB</span>
                </div>
              </div>

              {/* Standby Memory Breakdown & Purge CTA */}
              <div className="pt-4 border-t border-[#1F293D] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="space-y-1">
                  <div className="text-xs font-display font-bold uppercase tracking-wider text-[#F8FAFC]">
                    Windows Standby Page List & Modified Working Set
                  </div>
                  <div className="text-xs font-mono text-[#94A3B8]">
                    Standby Cached:{' '}
                    <span data-testid="standby-list-mb" className="text-[#F59E0B] font-semibold">
                      {storage.standbyListMb} MB
                    </span>{' '}
                    · Modified List: <span className="text-[#F8FAFC]">{storage.modifiedPageListMb} MB</span>
                    {storage.lastPurgeTimestamp ? (
                      <span className="text-[#00FFA3]"> · Last Purged {storage.lastPurgeTimestamp}</span>
                    ) : null}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={onPurgeStandbyMemory}
                  disabled={busyAction === 'purge-ram'}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-xs font-display font-bold tracking-wider uppercase bg-[#00F2FE] text-[#0B0F19] hover:bg-[#38BDF8] shadow-[0_0_15px_rgba(0,242,254,0.3)] transition-all whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>
                    {busyAction === 'purge-ram' ? 'PURGING PAGES...' : 'PURGE STANDBY MEMORY'}
                  </span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: AI Spatial Upscaler & Frame Gen */}
        {activeTab === 'spatial-upscaler' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Controls Column */}
            <div className="lg:col-span-5 space-y-4">
              <div className="space-y-1.5">
                <label
                  htmlFor="upscaler-shader-select"
                  className="block text-xs font-display font-bold uppercase tracking-wider text-[#F8FAFC]"
                >
                  Scaling Shader Pipeline
                </label>
                <select
                  id="upscaler-shader-select"
                  value={upscaler.shader}
                  onChange={(e) => onUpdateUpscaler({ shader: e.target.value as UpscalerShaderId })}
                  className="w-full px-3 py-2 rounded-lg bg-[#0B0F19] border border-[#1F293D] text-xs font-mono text-[#F8FAFC] focus:outline-none focus:border-[#00F2FE]"
                >
                  <option value="AMD_RCAS">AMD FidelityFX RCAS (Contrast Adaptive Sharpening)</option>
                  <option value="MAGPIE_ACNET">Magpie ACNet (CNN Spatial Reconstruction)</option>
                  <option value="RIFE_VULKAN">RIFE v4.15 Vulkan (Optical Flow Frame Gen)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label
                    htmlFor="input-res-select"
                    className="block text-[11px] font-mono uppercase text-[#94A3B8]"
                  >
                    Render Resolution
                  </label>
                  <select
                    id="input-res-select"
                    value={upscaler.inputResolution}
                    onChange={(e) =>
                      onUpdateUpscaler({
                        inputResolution: e.target.value as UpscalerConfig['inputResolution'],
                      })
                    }
                    className="w-full px-2.5 py-2 rounded-lg bg-[#0B0F19] border border-[#1F293D] text-xs font-mono text-[#F8FAFC]"
                  >
                    <option value="1280x720">1280x720 (720p Fast)</option>
                    <option value="1600x900">1600x900 (900p Balanced)</option>
                    <option value="1920x1080">1920x1080 (1080p Native)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label
                    htmlFor="output-res-select"
                    className="block text-[11px] font-mono uppercase text-[#94A3B8]"
                  >
                    Target Output
                  </label>
                  <select
                    id="output-res-select"
                    value={upscaler.outputResolution}
                    onChange={(e) =>
                      onUpdateUpscaler({
                        outputResolution: e.target.value as UpscalerConfig['outputResolution'],
                      })
                    }
                    className="w-full px-2.5 py-2 rounded-lg bg-[#0B0F19] border border-[#1F293D] text-xs font-mono text-[#F8FAFC]"
                  >
                    <option value="1920x1080">1920x1080 (FHD)</option>
                    <option value="2560x1440">2560x1440 (QHD)</option>
                    <option value="3840x2160">3840x2160 (4K UHD)</option>
                  </select>
                </div>
              </div>

              {/* Sharpness Slider */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-mono">
                  <label htmlFor="rcas-sharpness-slider" className="text-[#94A3B8]">
                    Sub-Pixel Sharpening Intensity
                  </label>
                  <span className="text-[#00F2FE] font-semibold">{upscaler.sharpness}%</span>
                </div>
                <input
                  id="rcas-sharpness-slider"
                  type="range"
                  min={0}
                  max={100}
                  value={upscaler.sharpness}
                  onChange={(e) => onUpdateUpscaler({ sharpness: Number(e.target.value) })}
                  className="w-full accent-[#00F2FE] cursor-pointer"
                />
              </div>

              {/* Frame Generation Multiplier */}
              <div className="space-y-1.5">
                <span className="block text-[11px] font-mono uppercase text-[#94A3B8]">
                  Vulkan Async Optical Flow Frame Multiplier
                </span>
                <div className="grid grid-cols-3 gap-2">
                  {([1, 2, 3] as const).map((mult) => (
                    <button
                      key={mult}
                      type="button"
                      onClick={() => onUpdateUpscaler({ frameGenMultiplier: mult })}
                      className={`py-2 px-3 rounded-lg text-xs font-mono font-semibold border transition-all cursor-pointer ${
                        upscaler.frameGenMultiplier === mult
                          ? 'bg-[#00F2FE]/20 text-[#00F2FE] border-[#00F2FE]'
                          : 'bg-[#0B0F19] text-[#94A3B8] border-[#1F293D] hover:text-[#F8FAFC]'
                      }`}
                    >
                      {mult === 1 ? '1x (Native)' : `${mult}x FrameGen`}
                    </button>
                  ))}
                </div>
              </div>

              {/* Telemetry Readout */}
              <div className="pt-3 border-t border-[#1F293D] grid grid-cols-3 gap-2 text-center font-mono">
                <div className="p-2 rounded bg-[#0B0F19] border border-[#1F293D]">
                  <div className="text-[10px] text-[#94A3B8]">SHADER PASS</div>
                  <div className="text-sm font-bold text-[#F8FAFC]">{upscalerMetrics.computeCostMs} ms</div>
                </div>
                <div className="p-2 rounded bg-[#0B0F19] border border-[#1F293D]">
                  <div className="text-[10px] text-[#94A3B8]">FPS GAIN</div>
                  <div className="text-sm font-bold text-[#00FFA3]">
                    +{upscalerMetrics.effectiveFpsBoostPercent}%
                  </div>
                </div>
                <div className="p-2 rounded bg-[#0B0F19] border border-[#1F293D]">
                  <div className="text-[10px] text-[#94A3B8]">EDGE CLARITY</div>
                  <div className="text-sm font-bold text-[#00F2FE]">
                    {upscalerMetrics.subpixelClarityScore}/100
                  </div>
                </div>
              </div>
            </div>

            {/* Interactive Preview Slider & Split Viewport */}
            <div className="lg:col-span-7 space-y-3">
              <div className="flex items-center justify-between text-xs font-mono">
                <label htmlFor="preview-split-slider" className="flex items-center gap-1.5 text-[#F8FAFC]">
                  <Sliders className="w-3.5 h-3.5 text-[#00F2FE]" />
                  <span>Interactive Split Comparison Preview</span>
                </label>
                <span className="text-[#00F2FE]">Split: {upscaler.previewSplitPercent}%</span>
              </div>

              <div className="relative w-full h-[250px] rounded-xl overflow-hidden border border-[#1F293D] bg-[#0B0F19]">
                <canvas
                  ref={upscalerCanvasRef}
                  className="w-full h-full block"
                />
              </div>

              <input
                id="preview-split-slider"
                type="range"
                min={10}
                max={90}
                value={upscaler.previewSplitPercent}
                onChange={(e) => onUpdateUpscaler({ previewSplitPercent: Number(e.target.value) })}
                aria-label="Upscaler Split Comparison Slider"
                className="w-full accent-[#00F2FE] cursor-pointer"
              />
            </div>
          </div>
        )}

        {/* TAB 3: Process Sandbox & CPU Affinity */}
        {activeTab === 'process-affinity' && (
          <div className="space-y-6">
            {/* Top Bar: 8-Core Matrix Header + 1-Click Isolation CTA */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <h3 className="font-display text-sm font-bold uppercase tracking-wider text-[#F8FAFC]">
                  8-Core Hybrid Topology Matrix (P-Cores 0–3 vs E-Cores 4–7)
                </h3>
                <p className="text-xs font-mono text-[#94A3B8]">
                  Pin latency-critical game threads to Golden Cove P-Cores (0x0F) and isolate background CEF/DWM bloat to Gracemont E-Cores (0xF0)
                </p>
              </div>
              <button
                type="button"
                onClick={onPinGamesToPCores}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-display font-bold uppercase tracking-wider bg-[#00FFA3] text-[#0B0F19] hover:bg-[#34D399] shadow-[0_0_15px_rgba(0,255,163,0.25)] transition-all whitespace-nowrap shrink-0 cursor-pointer"
              >
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>Enforce P-Core 0–3 Isolation (0x0F)</span>
              </button>
            </div>

            {/* 8-Core Grid Visualizer */}
            <div className="grid grid-cols-2 sm:grid-cols-4 xl:grid-cols-8 gap-2.5">
              {cores.map((core) => {
                const isPCore = core.type === 'P-CORE';
                return (
                  <div
                    key={core.coreId}
                    className={`p-3 rounded-lg bg-[#0B0F19] border space-y-2 ${
                      isPCore ? 'border-[#00F2FE]/40' : 'border-[#1F293D]'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[11px] font-mono">
                      <span className={isPCore ? 'text-[#00F2FE] font-bold' : 'text-[#94A3B8]'}>
                        {core.label}
                      </span>
                      <span className="text-[#F8FAFC]">{core.loadPercent}%</span>
                    </div>

                    <div className="w-full h-1.5 bg-[#161F30] rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-200 ${
                          isPCore ? 'bg-[#00F2FE]' : 'bg-[#F59E0B]'
                        }`}
                        style={{ width: `${core.loadPercent}%` }}
                      />
                    </div>

                    <div className="text-[10px] font-mono text-[#94A3B8] flex items-center justify-between">
                      <span>{core.clockMhz} MHz</span>
                      <span>{core.tempC}°C</span>
                    </div>

                    <div className="pt-1 border-t border-[#1F293D] text-[10px] font-mono text-[#F8FAFC] truncate">
                      {core.pinnedThreads.join(', ')}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Process Thread Affinity Sandbox Table */}
            <div className="overflow-x-auto border border-[#1F293D] rounded-lg">
              <table className="w-full text-left border-collapse text-xs font-mono">
                <thead>
                  <tr className="bg-[#0B0F19] text-[#94A3B8] border-b border-[#1F293D]">
                    <th className="py-2.5 px-3">PROCESS EXECUTABLE</th>
                    <th className="py-2.5 px-3">PRIORITY</th>
                    <th className="py-2.5 px-3">BITMASK</th>
                    <th className="py-2.5 px-3">CPU CORE AFFINITY TOGGLES (0–3 P-CORES / 4–7 E-CORES)</th>
                    <th className="py-2.5 px-3 text-right">STATUS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1F293D]">
                  {processes.map((proc) => (
                    <tr key={proc.pid} className="hover:bg-[#161F30]/50">
                      <td className="py-2.5 px-3 text-[#F8FAFC] font-medium whitespace-nowrap">
                        {proc.name}{' '}
                        <span className="text-[#94A3B8] text-[11px]">(PID {proc.pid})</span>
                      </td>
                      <td className="py-2.5 px-3 text-[#00F2FE] whitespace-nowrap">{proc.priority}</td>
                      <td className="py-2.5 px-3 text-[#00FFA3] font-semibold whitespace-nowrap">
                        {formatAffinityBitmask(proc.assignedCores)}
                      </td>
                      <td className="py-2.5 px-3">
                        <div className="flex items-center gap-1">
                          {[0, 1, 2, 3, 4, 5, 6, 7].map((coreIdx) => {
                            const active = proc.assignedCores.includes(coreIdx);
                            const isPCore = coreIdx <= 3;
                            return (
                              <button
                                key={coreIdx}
                                type="button"
                                onClick={() => onToggleProcessCore(proc.pid, coreIdx)}
                                aria-label={`Toggle Core ${coreIdx} for ${proc.name}`}
                                className={`w-6 h-6 rounded text-[11px] font-mono font-bold transition-colors cursor-pointer ${
                                  active
                                    ? isPCore
                                      ? 'bg-[#00F2FE] text-[#0B0F19]'
                                      : 'bg-[#F59E0B] text-[#0B0F19]'
                                    : 'bg-[#0B0F19] text-[#94A3B8] border border-[#1F293D] hover:border-[#00F2FE]'
                                }`}
                              >
                                {coreIdx}
                              </button>
                            );
                          })}
                        </div>
                      </td>
                      <td className="py-2.5 px-3 text-right whitespace-nowrap">
                        {proc.isIsolated ? (
                          <span className="text-[#00FFA3]">● ISOLATED</span>
                        ) : (
                          <span className="text-[#F59E0B]">▲ MIXED CCX</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 4: Real-Time Sensor Telemetry */}
        {activeTab === 'sensor-telemetry' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Gauge 1: VRAM Bus Saturation */}
              <div className="p-4 rounded-xl bg-[#0B0F19] border border-[#1F293D] space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-display font-bold uppercase tracking-wider text-[#F8FAFC]">
                    VRAM Bus Saturation
                  </span>
                  <span className="font-mono text-[#00F2FE]">
                    {sensors.vramBandwidthGbPerSec} GB/s
                  </span>
                </div>

                <div className="flex items-baseline justify-between">
                  <div>
                    <span className="text-2xl font-mono font-bold text-[#F8FAFC] tabular-nums">
                      {sensors.vramBusSaturationPercent}%
                    </span>
                    <span className="text-xs font-mono text-[#94A3B8] ml-1.5">BUS LOAD</span>
                  </div>
                  <div className="text-xs font-mono text-[#94A3B8]">
                    {sensors.vramUsedGb} / {sensors.vramTotalGb} GB GDDR6X
                  </div>
                </div>

                <div className="w-full h-2 bg-[#161F30] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#00F2FE] transition-all duration-200"
                    style={{ width: `${sensors.vramBusSaturationPercent}%` }}
                  />
                </div>

                <div className="pt-1 text-[11px] font-mono text-[#94A3B8] flex items-center justify-between">
                  <span>Bus: {sensors.pcieLinkSpeed}</span>
                  <span className="text-[#00FFA3]">ReBAR: ENABLED</span>
                </div>
              </div>

              {/* Gauge 2: PWM Cooling & Fan Tachometers */}
              <div className="p-4 rounded-xl bg-[#0B0F19] border border-[#1F293D] space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-display font-bold uppercase tracking-wider text-[#F8FAFC]">
                    PWM Tachometer Array
                  </span>
                  <span className="inline-flex items-center gap-1 font-mono text-[#00FFA3]">
                    <Fan className="w-3.5 h-3.5" /> {sensors.fanProfile}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 font-mono text-center">
                  <div className="p-2 rounded bg-[#111827] border border-[#1F293D]">
                    <div className="text-[10px] text-[#94A3B8]">CPU AIO</div>
                    <div className="text-sm font-bold text-[#F8FAFC] tabular-nums">
                      {sensors.cpuFanRpm}
                    </div>
                    <div className="text-[10px] text-[#00F2FE]">RPM</div>
                  </div>
                  <div className="p-2 rounded bg-[#111827] border border-[#1F293D]">
                    <div className="text-[10px] text-[#94A3B8]">GPU AXIAL</div>
                    <div className="text-sm font-bold text-[#F8FAFC] tabular-nums">
                      {sensors.gpuFanRpm}
                    </div>
                    <div className="text-[10px] text-[#00FFA3]">RPM</div>
                  </div>
                  <div className="p-2 rounded bg-[#111827] border border-[#1F293D]">
                    <div className="text-[10px] text-[#94A3B8]">CHASSIS</div>
                    <div className="text-sm font-bold text-[#F8FAFC] tabular-nums">
                      {sensors.chassisFanRpm}
                    </div>
                    <div className="text-[10px] text-[#94A3B8]">RPM</div>
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-1.5 pt-1">
                  {(['SILENT', 'BALANCED', 'TURBO_CURVE', 'MAX_COOLING'] as const).map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => onSetFanProfile(preset)}
                      className={`py-1 px-1.5 rounded text-[10px] font-mono font-semibold transition-colors cursor-pointer ${
                        sensors.fanProfile === preset
                          ? 'bg-[#00F2FE] text-[#0B0F19]'
                          : 'bg-[#161F30] text-[#94A3B8] hover:text-[#F8FAFC]'
                      }`}
                    >
                      {preset.replace('_CURVE', '').replace('_COOLING', '')}
                    </button>
                  ))}
                </div>
              </div>

              {/* Gauge 3: VRM & Core Rail Voltages */}
              <div className="p-4 rounded-xl bg-[#0B0F19] border border-[#1F293D] space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-display font-bold uppercase tracking-wider text-[#F8FAFC]">
                    VRM Core Voltage Rails
                  </span>
                  <span className="font-mono text-[#00FFA3]">LLC LEVEL 4</span>
                </div>

                <div className="space-y-2 font-mono text-xs">
                  <div className="flex items-center justify-between py-1 border-b border-[#1F293D]">
                    <span className="text-[#94A3B8]">CPU VCore (VID):</span>
                    <span className="text-[#F8FAFC] font-bold">{sensors.vcoreMv} mV (1.245 V)</span>
                  </div>
                  <div className="flex items-center justify-between py-1 border-b border-[#1F293D]">
                    <span className="text-[#94A3B8]">GPU Core Rail (NVVDD):</span>
                    <span className="text-[#00F2FE] font-bold">{sensors.gpuCoreMv} mV (0.985 V)</span>
                  </div>
                  <div className="flex items-center justify-between py-1">
                    <span className="text-[#94A3B8]">DDR5 VDDQ / VDD2:</span>
                    <span className="text-[#00FFA3] font-bold">{sensors.dimmVoltageMv} mV (1.350 V)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: AI Engine Advisor */}
        {activeTab === 'engine-advisor' && (
          <div className="space-y-4">
            {/* Quick Diagnostic Prompts */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-mono text-[#94A3B8]">Quick Diagnostics:</span>
              {[
                'Fix 112 FPS Drop -> Boost 300+ FPS',
                'Diagnose 20 FPS DWM Swapchain Crisis',
                'Optimize Valorant 1% Low CPU Affinity',
                'Purge Windows Standby RAM Bloat',
                'Best AMD RCAS Sharpness for 720p DirectFlip',
              ].map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => onSendAdvisorPrompt(q)}
                  className="px-2.5 py-1 rounded-md bg-[#0B0F19] hover:bg-[#161F30] border border-[#1F293D] hover:border-[#00F2FE]/50 text-xs font-mono text-[#00F2FE] transition-colors cursor-pointer"
                >
                  {q}
                </button>
              ))}
            </div>

            {/* Advisor Message Stream */}
            <div
              ref={advisorStreamRef}
              className="h-[220px] overflow-y-auto p-4 rounded-xl bg-[#0B0F19] border border-[#1F293D] space-y-3"
            >
              {advisorMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={`p-3 rounded-lg border text-xs space-y-2 ${
                    msg.role === 'advisor'
                      ? 'bg-[#111827] border-[#1F293D] text-[#F8FAFC]'
                      : 'bg-[#00F2FE]/10 border-[#00F2FE]/30 text-[#00F2FE] ml-8'
                  }`}
                >
                  <div className="flex items-center justify-between font-mono text-[11px] text-[#94A3B8]">
                    <span className="font-bold uppercase text-[#F8FAFC]">
                      {msg.role === 'advisor' ? 'NEXUS TELEMETRY ADVISOR' : 'OPERATOR QUERY'}
                    </span>
                    <span>{msg.timestamp}</span>
                  </div>
                  <p className="leading-relaxed">{msg.content}</p>
                  {msg.recommendedAction ? (
                    <div className="pt-1">
                      <button
                        type="button"
                        onClick={() => executeAdvisorAction(msg.recommendedAction!.actionType)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#00FFA3] text-[#0B0F19] font-display font-bold text-xs uppercase tracking-wider hover:bg-[#34D399] transition-colors cursor-pointer"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>{msg.recommendedAction.label}</span>
                      </button>
                    </div>
                  ) : null}
                </div>
              ))}
            </div>

            {/* Advisor Input Bar */}
            <form onSubmit={handleAdvisorSubmit} className="flex items-center gap-2">
              <input
                type="text"
                value={advisorInput}
                onChange={(e) => setAdvisorInput(e.target.value)}
                placeholder="Ask Nexus Advisor about frame pacing, DWM DirectFlip, P-Core affinity, or RCAS shaders..."
                aria-label="Query Optimization Advisor"
                className="flex-1 px-3.5 py-2.5 rounded-lg bg-[#0B0F19] border border-[#1F293D] text-xs font-mono text-[#F8FAFC] placeholder:text-[#94A3B8]/60 focus:outline-none focus:border-[#00F2FE]"
              />
              <button
                type="submit"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#00F2FE] text-[#0B0F19] font-display font-bold text-xs uppercase tracking-wider hover:bg-[#38BDF8] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Analyze</span>
              </button>
            </form>
          </div>
        )}
      </div>
    </section>
  );
};

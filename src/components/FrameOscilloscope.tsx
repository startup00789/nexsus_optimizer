import React, { useEffect, useRef, useState } from 'react';
import { Activity, Pause, Play, Flame } from 'lucide-react';
import type { FrameSample } from '../types/nexus.ts';

interface FrameOscilloscopeProps {
  frames: FrameSample[];
  paused: boolean;
  onTogglePause: () => void;
  onInjectSpike: () => void;
  dwmCrisisMode: boolean;
}

export const FrameOscilloscope: React.FC<FrameOscilloscopeProps> = ({
  frames,
  paused,
  onTogglePause,
  onInjectSpike,
  dwmCrisisMode,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [hoveredFrame, setHoveredFrame] = useState<FrameSample | null>(null);

  const anomalyCount = frames.filter((f) => f.isAnomaly).length;
  const maxFrameMs = Math.max(...frames.map((f) => f.frameTimeMs), 20);
  const avgFrameMs =
    frames.reduce((acc, item) => acc + item.frameTimeMs, 0) / Math.max(1, frames.length);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = typeof window !== 'undefined' ? Math.min(window.devicePixelRatio || 1, 2) : 1;
    const rect = canvas.getBoundingClientRect();
    const width = rect.width || 960;
    const height = rect.height || 210;

    if (canvas.width !== width * dpr || canvas.height !== height * dpr) {
      canvas.width = width * dpr;
      canvas.height = height * dpr;
    }

    ctx.save();
    ctx.scale(dpr, dpr);

    // Clear background
    ctx.fillStyle = '#0B0F19';
    ctx.fillRect(0, 0, width, height);

    // Subtle oscilloscope coordinate grid
    ctx.strokeStyle = '#161F30';
    ctx.lineWidth = 1;
    const vSteps = 12;
    for (let i = 1; i < vSteps; i++) {
      const x = (width / vSteps) * i;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }

    // Y-axis mapping: 0ms at bottom (height - 20) to maxScaleMs at top (16)
    const maxScaleMs = dwmCrisisMode || maxFrameMs > 24 ? 55 : 22;
    const padTop = 18;
    const padBottom = 22;
    const plotHeight = height - padTop - padBottom;

    const msToY = (ms: number) => {
      const clamped = Math.max(0, Math.min(maxScaleMs, ms));
      return padTop + plotHeight * (1 - clamped / maxScaleMs);
    };

    // Draw reference threshold lines: 16.6ms (60 FPS), 8.3ms (120 FPS), 4.1ms (240 FPS)
    const thresholds = [
      { ms: 16.6, label: '16.6ms (60 FPS)', color: '#EF4444' },
      { ms: 8.3, label: '8.3ms (120 FPS)', color: '#F59E0B' },
      { ms: 4.1, label: '4.1ms (240 FPS)', color: '#00FFA3' },
    ];

    ctx.font = '500 10px "JetBrains Mono", monospace';
    for (const t of thresholds) {
      const y = msToY(t.ms);
      ctx.save();
      ctx.strokeStyle = t.color;
      ctx.globalAlpha = 0.45;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
      ctx.restore();

      // Label tag on right edge
      ctx.fillStyle = '#0B0F19';
      ctx.fillRect(width - 114, y - 11, 110, 13);
      ctx.fillStyle = t.color;
      ctx.fillText(t.label, width - 110, y - 1);
    }

    // Plot histogram bars + connected telemetry waveform
    const count = frames.length;
    const slotWidth = (width - 120) / Math.max(1, count);

    // 1. Histogram bars
    frames.forEach((sample, idx) => {
      const x = 8 + idx * slotWidth;
      const y = msToY(sample.frameTimeMs);
      const barH = Math.max(2, height - padBottom - y);
      const barW = Math.max(2, slotWidth * 0.58);

      if (sample.isAnomaly) {
        ctx.fillStyle = 'rgba(239, 68, 68, 0.45)';
      } else if (sample.frameTimeMs <= 4.3) {
        ctx.fillStyle = 'rgba(0, 242, 254, 0.22)';
      } else {
        ctx.fillStyle = 'rgba(0, 255, 163, 0.22)';
      }
      ctx.fillRect(x, y, barW, barH);
    });

    // 2. Crisp connected line trace
    ctx.beginPath();
    frames.forEach((sample, idx) => {
      const x = 8 + idx * slotWidth + slotWidth * 0.29;
      const y = msToY(sample.frameTimeMs);
      if (idx === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.strokeStyle = dwmCrisisMode ? '#EF4444' : '#00F2FE';
    ctx.lineWidth = 2;
    ctx.stroke();

    // 3. Draw micro-stutter anomaly flags on any frame exceeding 16.6ms
    frames.forEach((sample, idx) => {
      if (!sample.isAnomaly) return;
      const x = 8 + idx * slotWidth + slotWidth * 0.29;
      const y = msToY(sample.frameTimeMs);

      ctx.fillStyle = '#EF4444';
      ctx.beginPath();
      ctx.arc(x, y, 3.5, 0, Math.PI * 2);
      ctx.fill();

      // Callout badge for the latest or first prominent spike
      if (!dwmCrisisMode || idx % 12 === 0) {
        ctx.fillStyle = 'rgba(239, 68, 68, 0.18)';
        ctx.fillRect(Math.max(4, x - 26), Math.max(2, y - 18), 54, 13);
        ctx.fillStyle = '#EF4444';
        ctx.font = '600 9px "JetBrains Mono", monospace';
        ctx.fillText(`${sample.frameTimeMs.toFixed(1)}ms!`, Math.max(6, x - 23), Math.max(11, y - 9));
      }
    });

    // Bottom X-axis frame window guide
    ctx.fillStyle = '#94A3B8';
    ctx.font = '400 10px "JetBrains Mono", monospace';
    ctx.fillText('T-60 FRAMES', 8, height - 6);
    ctx.fillText('T-30 FRAMES', (width - 120) * 0.5, height - 6);
    ctx.fillText('LIVE NOW (0ms)', width - 205, height - 6);

    ctx.restore();
  }, [frames, dwmCrisisMode, maxFrameMs]);

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || frames.length === 0) return;
    const rect = canvas.getBoundingClientRect();
    const relX = e.clientX - rect.left - 8;
    const plotWidth = rect.width - 120;
    const idx = Math.floor((relX / Math.max(1, plotWidth)) * frames.length);
    if (idx >= 0 && idx < frames.length) {
      setHoveredFrame(frames[idx]);
    } else {
      setHoveredFrame(null);
    }
  };

  return (
    <section
      id="frame-oscilloscope"
      aria-label="Real-Time Frame Pacing Oscilloscope"
      className="p-4 sm:p-5 rounded-xl bg-[#111827] border border-[#1F293D] space-y-3.5"
    >
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2.5">
            <Activity className="w-4 h-4 text-[#00F2FE]" />
            <h2 className="font-display text-sm sm:text-base font-bold tracking-wider uppercase text-[#F8FAFC]">
              Real-Time Frame Pacing Oscilloscope (60-Frame Sliding Window)
            </h2>
          </div>
          <p className="text-xs text-[#94A3B8] font-mono">
            Avg Frame Time: <span className="text-[#F8FAFC]">{avgFrameMs.toFixed(2)} ms</span> · Peak:{' '}
            <span className="text-[#F8FAFC]">{maxFrameMs.toFixed(2)} ms</span> · Micro-Stutter Flags (&gt;16.6ms):{' '}
            <span className={anomalyCount > 0 ? 'text-[#EF4444] font-semibold' : 'text-[#00FFA3]'}>
              {anomalyCount}
            </span>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          {hoveredFrame ? (
            <div className="px-2.5 py-1 rounded bg-[#161F30] border border-[#1F293D] text-xs font-mono text-[#F8FAFC] whitespace-nowrap">
              Frame #{hoveredFrame.id}: <span className="text-[#00F2FE]">{hoveredFrame.frameTimeMs}ms</span> (
              {hoveredFrame.fps} FPS)
            </div>
          ) : null}

          <button
            type="button"
            onClick={onInjectSpike}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono text-[#F59E0B] bg-[#161F30] hover:bg-[#1F293D] border border-[#1F293D] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Flame className="w-3.5 h-3.5" />
            <span>Inject Stutter Spike</span>
          </button>

          <button
            type="button"
            onClick={onTogglePause}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono text-[#F8FAFC] bg-[#161F30] hover:bg-[#1F293D] border border-[#1F293D] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            {paused ? <Play className="w-3.5 h-3.5 text-[#00FFA3]" /> : <Pause className="w-3.5 h-3.5 text-[#00F2FE]" />}
            <span>{paused ? 'Resume Stream' : 'Freeze Trace'}</span>
          </button>
        </div>
      </div>

      {/* Interactive Oscilloscope Canvas */}
      <div className="relative w-full h-[210px] rounded-lg overflow-hidden border border-[#1F293D] bg-[#0B0F19]">
        <canvas
          ref={canvasRef}
          data-testid="frame-oscilloscope-canvas"
          onMouseMove={handleMouseMove}
          onMouseLeave={() => setHoveredFrame(null)}
          className="w-full h-full block cursor-crosshair"
        />
      </div>

      {/* Reference Threshold Legend */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs font-mono text-[#94A3B8]">
        <div className="flex flex-wrap items-center gap-4">
          <span className="inline-flex items-center gap-1.5">
            <span className="w-2.5 h-0.5 bg-[#00FFA3]" /> 4.1ms (240 FPS Target)
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="w-2.5 h-0.5 bg-[#F59E0B]" /> 8.3ms (120 FPS Threshold)
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="w-2.5 h-0.5 bg-[#EF4444]" /> 16.6ms (60 FPS Micro-Stutter Ceiling)
          </span>
        </div>
        <span>Hover waveform to inspect individual PresentMon ETW frame packets</span>
      </div>
    </section>
  );
};

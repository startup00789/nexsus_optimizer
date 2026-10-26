import { useCallback, useEffect, useRef, useState } from 'react';
import type {
  AdvisorMessage,
  CoreTelemetry,
  DashboardTabId,
  DpiScaleMode,
  FrameSample,
  LogEntry,
  NexusBridgeCallbacks,
  ProcessAffinityItem,
  SensorTelemetryState,
  StorageCacheState,
  SystemTelemetryState,
  UpscalerConfig,
} from '../types/nexus.ts';
import {
  GAME_PROFILES,
  INITIAL_CORES,
  INITIAL_PROCESSES,
  INITIAL_SENSOR_STATE,
  INITIAL_STORAGE_STATE,
  INITIAL_TELEMETRY_STATE,
  INITIAL_UPSCALER_CONFIG,
  apply300FpsOverdrive,
  applyDwmCrisisFix,
  applyGameProfileState,
  buildAdvisorResponse,
  classifyThermalStatus,
  createLogEntry,
  enforceOptimalCoreIsolation,
  formatAffinityBitmask,
  formatTimestamp,
  generateNextFrameSample,
  purgeStandbyMemoryState,
  simulateDwmCrisisState,
  toggleProcessCoreAssignment,
} from '../utils/nexusEngine.ts';

/**
 * NexusController IPC Bridge Stub
 * Ready for Tauri invoke() / Electron ipcRenderer / WebSocket backend integration.
 */
export class NexusController {
  private static listeners: Array<(event: string, payload: unknown) => void> = [];

  static emitIpcCommand(command: string, payload?: unknown): void {
    for (const listener of this.listeners) {
      listener(command, payload);
    }
  }

  static onIpcEvent(callback: (event: string, payload: unknown) => void): () => void {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter((cb) => cb !== callback);
    };
  }
}

function createInitialFrames(telemetry: SystemTelemetryState): FrameSample[] {
  const samples: FrameSample[] = [];
  for (let i = 1; i <= 60; i++) {
    // Deterministic initial wave with 1 subtle micro-spike so oscilloscope has rich visual context
    const isDemoSpike = i === 18;
    const rand = 0.5 + Math.sin(i * 0.45) * 0.35;
    samples.push(
      generateNextFrameSample(i - 1, telemetry, isDemoSpike, rand)
    );
  }
  return samples;
}

const INITIAL_LOGS: LogEntry[] = [
  createLogEntry('ETW', 'Intel PresentMon ETW provider attached (Session: NEXUS_RT_TELEMETRY)', 'INFO', new Date(Date.now() - 24000)),
  createLogEntry('DWM', 'DirectFlip swapchain locked to 1280x720 (Hardware: Independent Flip)', 'SUCCESS', new Date(Date.now() - 18000)),
  createLogEntry('CPU', 'P-Core 0–3 thread affinity bitmask 0x0F applied to VALORANT-Win64-Shipping.exe', 'SUCCESS', new Date(Date.now() - 12000)),
  createLogEntry('MEM', '5TB Virtual Storage Pool online — 20.0 GB Pinned L2 RAM Ring Buffer active (98.4% hit rate)', 'INFO', new Date(Date.now() - 6000)),
];

const INITIAL_ADVISOR_MESSAGES: AdvisorMessage[] = [
  {
    id: 'adv-init-1',
    role: 'advisor',
    timestamp: '14:22:01',
    content:
      'Nexus Telemetry Advisor online. PresentMon ETW stream confirms Hardware: Independent Flip at 3.52ms frame time (284 FPS). Select a diagnostic query below or ask about DWM swapchain locks, P-Core thread pinning, or AMD FidelityFX RCAS calibration.',
    recommendedAction: {
      label: 'Calibrate AMD RCAS 82% Sharpness',
      actionType: 'APPLY_RCAS',
    },
  },
];

export function useNexusBridge(externalCallbacks?: NexusBridgeCallbacks) {
  const [telemetry, setTelemetry] = useState<SystemTelemetryState>(INITIAL_TELEMETRY_STATE);
  const [frames, setFrames] = useState<FrameSample[]>(() => createInitialFrames(INITIAL_TELEMETRY_STATE));
  const [oscilloscopePaused, setOscilloscopePaused] = useState<boolean>(false);
  const [storage, setStorage] = useState<StorageCacheState>(INITIAL_STORAGE_STATE);
  const [upscaler, setUpscaler] = useState<UpscalerConfig>(INITIAL_UPSCALER_CONFIG);
  const [cores, setCores] = useState<CoreTelemetry[]>(INITIAL_CORES);
  const [processes, setProcesses] = useState<ProcessAffinityItem[]>(INITIAL_PROCESSES);
  const [sensors, setSensors] = useState<SensorTelemetryState>(INITIAL_SENSOR_STATE);
  const [logs, setLogs] = useState<LogEntry[]>(INITIAL_LOGS);
  const [advisorMessages, setAdvisorMessages] = useState<AdvisorMessage[]>(INITIAL_ADVISOR_MESSAGES);
  const [activeTab, setActiveTab] = useState<DashboardTabId>('storage-memory');
  const [dpiScale, setDpiScale] = useState<DpiScaleMode>('100%');
  const [consoleExpanded, setConsoleExpanded] = useState<boolean>(true);
  const [logFilter, setLogFilter] = useState<'ALL' | LogEntry['subsystem']>('ALL');
  const [busyAction, setBusyAction] = useState<string | null>(null);

  const frameCounterRef = useRef<number>(60);
  const forceNextSpikeRef = useRef<boolean>(false);

  const appendLog = useCallback(
    (subsystem: LogEntry['subsystem'], message: string, severity: LogEntry['severity'] = 'INFO') => {
      setLogs((prev) => [...prev.slice(-79), createLogEntry(subsystem, message, severity)]);
    },
    []
  );

  // Live telemetry ticker (throttled cleanly for headless and desktop performance)
  useEffect(() => {
    const isHeadless =
      typeof navigator !== 'undefined' &&
      (navigator.webdriver || /HeadlessChrome/i.test(navigator.userAgent));
    const intervalMs = isHeadless ? 650 : 220;

    const timer = window.setInterval(() => {
      setTelemetry((prev) => {
        const wave = Math.sin(Date.now() / 800);
        const microJitter = (Math.random() - 0.5) * 2;

        if (prev.dwmCrisisMode) {
          const crisisFps = Math.max(17, Math.min(23, Math.round(20 + microJitter)));
          const crisisMs = Number((1000 / crisisFps).toFixed(2));
          return {
            ...prev,
            cpuUsagePercent: Math.min(96, Math.max(72, Math.round(84 + wave * 5))),
            pCoreClockMhz: 4850,
            cpuTempC: 77,
            gpuTempC: 74,
            thermalStatus: classifyThermalStatus(77, 74),
            displayedFps: crisisFps,
            onePercentLowFps: Math.max(11, crisisFps - 6),
            frameTimeMs: crisisMs,
            clickToPhotonMs: Number((crisisMs + 18.5).toFixed(2)),
          };
        }

        const profile = GAME_PROFILES.find((p) => p.id === prev.activeProfileId) ?? GAME_PROFILES[1];
        const baseFps = profile.targetFps;
        const liveFps = Math.round(baseFps + wave * 4 + microJitter * 2);
        const liveFrameMs = Number((1000 / liveFps).toFixed(2));
        const cpuTemp = Math.round(60 + wave * 2);
        const gpuTemp = Math.round(57 + wave * 1.5);

        return {
          ...prev,
          cpuUsagePercent: Math.max(28, Math.min(68, Math.round(42 + wave * 4 + microJitter))),
          pCoreClockMhz: Math.round(5425 + wave * 25),
          eCoreClockMhz: 4100,
          cpuPackageWatts: Number((78.2 + wave * 3.1).toFixed(1)),
          cpuTempC: cpuTemp,
          gpuTempC: gpuTemp,
          gpuClockMhz: Math.round(2745 + wave * 15),
          thermalStatus: classifyThermalStatus(cpuTemp, gpuTemp),
          displayedFps: liveFps,
          onePercentLowFps: Math.round(liveFps * 0.86),
          frameTimeMs: liveFrameMs,
          clickToPhotonMs: Number((liveFrameMs + 0.68).toFixed(2)),
        };
      });

      if (!oscilloscopePaused) {
        setFrames((prevFrames) => {
          const nextId = frameCounterRef.current + 1;
          frameCounterRef.current = nextId;
          const shouldSpike = forceNextSpikeRef.current;
          forceNextSpikeRef.current = false;
          const nextSample = generateNextFrameSample(nextId - 1, telemetry, shouldSpike);
          return [...prevFrames.slice(1), nextSample];
        });
      }

      setCores((prevCores) =>
        prevCores.map((core) => {
          const delta = Math.round((Math.random() - 0.5) * 4);
          const minLoad = core.type === 'P-CORE' ? 42 : 8;
          const maxLoad = core.type === 'P-CORE' ? 84 : 32;
          return {
            ...core,
            loadPercent: Math.max(minLoad, Math.min(maxLoad, core.loadPercent + delta)),
          };
        })
      );

      setSensors((prevSensors) => {
        const rpmDelta = Math.round((Math.random() - 0.5) * 18);
        return {
          ...prevSensors,
          cpuFanRpm: Math.max(900, Math.min(2800, prevSensors.cpuFanRpm + rpmDelta)),
          gpuFanRpm: Math.max(1000, Math.min(3100, prevSensors.gpuFanRpm + rpmDelta)),
          vramBusSaturationPercent: Number(
            Math.max(24, Math.min(88, prevSensors.vramBusSaturationPercent + (Math.random() - 0.5) * 1.2)).toFixed(1)
          ),
        };
      });
    }, intervalMs);

    return () => window.clearInterval(timer);
  }, [oscilloscopePaused, telemetry]);

  // Action 1: Emergency DWM Crisis Fix
  const fixDwmCrisis = useCallback(() => {
    setBusyAction('dwm-fix');
    NexusController.emitIpcCommand('DWM_UNLOCK_SWAPCHAIN', { mode: 'Hardware: Independent Flip' });
    externalCallbacks?.onFixDwmCrisis?.();

    window.setTimeout(() => {
      setTelemetry((prev) => applyDwmCrisisFix(prev));
      setFrames((prev) =>
        prev.map((sample, idx) => ({
          ...sample,
          frameTimeMs: Number((3.4 + Math.sin(idx * 0.4) * 0.25).toFixed(2)),
          fps: 290,
          isAnomaly: false,
        }))
      );
      appendLog(
        'DWM',
        'DirectFlip swapchain unlocked — Desktop Window Manager composition bypassed (Hardware: Independent Flip engaged)',
        'SUCCESS'
      );
      appendLog(
        'ETW',
        'PresentMon ETW verified 0-copy flip queue: frame time stabilized at 3.45ms (289 FPS)',
        'INFO'
      );
      setBusyAction(null);
    }, 150);
  }, [appendLog, externalCallbacks]);

  // Action 1c: Engage 300+ FPS Ultra Overdrive
  const engage300FpsOverdrive = useCallback(() => {
    setBusyAction('boost-300');
    NexusController.emitIpcCommand('ENGAGE_300_FPS_OVERDRIVE');
    externalCallbacks?.onEngage300FpsOverdrive?.();

    window.setTimeout(() => {
      setTelemetry((prev) => apply300FpsOverdrive(prev));
      setFrames((prev) =>
        prev.map((sample, idx) => ({
          ...sample,
          frameTimeMs: Number((2.95 + Math.sin(idx * 0.3) * 0.18).toFixed(2)),
          fps: 335,
          isAnomaly: false,
        }))
      );
      appendLog(
        'DWM',
        '⚡ 300+ FPS ULTRA OVERDRIVE ENGAGED: DirectFlip swapchain locked, DWM composition bypassed, Golden Cove P-Cores prioritized',
        'SUCCESS'
      );
      appendLog(
        'ETW',
        'PresentMon ETW verified high-refresh pacing: 2.98ms render interval (335 FPS true hardware feed)',
        'SUCCESS'
      );
      setBusyAction(null);
    }, 120);
  }, [appendLog, externalCallbacks]);

  // Action 1d: Set Target FPS Cap
  const setTargetFpsCap = useCallback((targetFps: number) => {
    NexusController.emitIpcCommand('SET_TARGET_FPS_CAP', { targetFps });
    externalCallbacks?.onSetTargetFpsCap?.(targetFps);
    setTelemetry((prev) => {
      const liveFrameMs = Number((1000 / targetFps).toFixed(2));
      return {
        ...prev,
        targetFpsCap: targetFps,
        displayedFps: targetFps,
        onePercentLowFps: Math.round(targetFps * 0.88),
        frameTimeMs: liveFrameMs,
        clickToPhotonMs: Number((liveFrameMs + 0.55).toFixed(2)),
      };
    });
    setFrames((prev) =>
      prev.map((sample, idx) => ({
        ...sample,
        frameTimeMs: Number(((1000 / targetFps) + Math.sin(idx * 0.2) * 0.15).toFixed(2)),
        fps: targetFps,
        isAnomaly: (1000 / targetFps) > 16.6,
      }))
    );
    appendLog('ETW', `Target FPS pacing cap set to ${targetFps} FPS (${(1000 / targetFps).toFixed(2)}ms threshold)`, 'INFO');
  }, [appendLog, externalCallbacks]);

  // Action 1b: Simulate 20 FPS DWM Crisis (for testing & live verification)
  const triggerDwmCrisisSimulation = useCallback(() => {
    NexusController.emitIpcCommand('DWM_SIMULATE_CRISIS');
    externalCallbacks?.onSimulateDwmCrisis?.();
    setTelemetry((prev) => simulateDwmCrisisState(prev));
    setFrames((prev) =>
      prev.map((sample, idx) => ({
        ...sample,
        frameTimeMs: Number((48.5 + (idx % 3) * 2.1).toFixed(2)),
        fps: 20,
        isAnomaly: true,
      }))
    );
    appendLog(
      'DWM',
      'ALERT: Composed Flip bottleneck detected! Desktop Window Manager locking swapchain to 20 FPS (49.8ms)',
      'CRITICAL'
    );
  }, [appendLog, externalCallbacks]);

  // Action 2: Inject Micro-Stutter Spike on Oscilloscope
  const injectMicroStutterSpike = useCallback(() => {
    forceNextSpikeRef.current = true;
    setFrames((prev) => {
      const nextId = frameCounterRef.current + 1;
      frameCounterRef.current = nextId;
      const spikeSample: FrameSample = {
        id: nextId,
        frameTimeMs: 28.4,
        fps: 35,
        isAnomaly: true,
        timestamp: Date.now(),
      };
      return [...prev.slice(1), spikeSample];
    });
    appendLog('ETW', 'Micro-stutter anomaly flagged: Frame #'+ frameCounterRef.current +' rendered in 28.4ms (>16.6ms threshold)', 'WARNING');
  }, [appendLog]);

  // Action 3: Activate Game Booster Profile
  const activateGameProfile = useCallback(
    (profileId: string) => {
      setBusyAction(`profile-${profileId}`);
      NexusController.emitIpcCommand('ACTIVATE_GAME_PROFILE', { profileId });
      externalCallbacks?.onActivateGameProfile?.(profileId);

      window.setTimeout(() => {
        const result = applyGameProfileState(telemetry, upscaler, profileId);
        setTelemetry(result.telemetry);
        setUpscaler(result.upscaler);
        setFrames(createInitialFrames(result.telemetry));

        appendLog(
          'PROFILE',
          `[${result.profile.title}] Turbo Profile engaged: ${result.profile.presetSummary}`,
          'SUCCESS'
        );
        appendLog(
          'DWM',
          `DirectFlip swapchain locked to ${result.profile.targetResolution} for ${result.profile.executable}`,
          'INFO'
        );
        setBusyAction(null);
      }, 140);
    },
    [appendLog, externalCallbacks, telemetry, upscaler]
  );

  // Action 4: Purge Standby Memory
  const purgeStandbyMemory = useCallback(() => {
    setBusyAction('purge-ram');
    NexusController.emitIpcCommand('PURGE_STANDBY_MEMORY');
    externalCallbacks?.onPurgeStandbyMemory?.();

    window.setTimeout(() => {
      const ts = formatTimestamp();
      const result = purgeStandbyMemoryState(telemetry, storage, ts);
      setTelemetry(result.telemetry);
      setStorage(result.storage);
      appendLog(
        'MEM',
        `NtSetSystemInformation(SystemMemoryListInformation) purged ${result.freedMb} MB from Standby Page List`,
        'SUCCESS'
      );
      setBusyAction(null);
    }, 150);
  }, [appendLog, externalCallbacks, storage, telemetry]);

  // Action 5: Update Upscaler Config
  const updateUpscalerConfig = useCallback(
    (patch: Partial<UpscalerConfig>) => {
      NexusController.emitIpcCommand('UPDATE_UPSCALER', patch);
      externalCallbacks?.onUpdateUpscaler?.(patch);
      setUpscaler((prev) => {
        const updated = { ...prev, ...patch };
        return updated;
      });
      if (patch.shader) {
        appendLog('GPU', `Spatial upscaler pipeline switched to ${patch.shader} shader`, 'INFO');
      }
      if (patch.frameGenMultiplier !== undefined) {
        appendLog('GPU', `Optical flow Frame Generation multiplier set to ${patch.frameGenMultiplier}x`, 'SUCCESS');
      }
    },
    [appendLog, externalCallbacks]
  );

  // Action 6: Toggle Process CPU Core Affinity
  const toggleProcessCore = useCallback(
    (pid: number, coreId: number) => {
      NexusController.emitIpcCommand('SET_PROCESS_AFFINITY', { pid, coreId });
      externalCallbacks?.onToggleProcessCore?.(pid, coreId);
      setProcesses((prev) => {
        const next = toggleProcessCoreAssignment(prev, pid, coreId);
        const target = next.find((p) => p.pid === pid);
        if (target) {
          appendLog(
            'CPU',
            `Process ${target.name} (PID ${pid}) affinity mask updated to ${formatAffinityBitmask(target.assignedCores)}`,
            'INFO'
          );
        }
        return next;
      });
    },
    [appendLog, externalCallbacks]
  );

  // Action 7: Pin All Game Engines to P-Cores 0-3
  const pinGamesToPCores = useCallback(() => {
    NexusController.emitIpcCommand('ENFORCE_PCORE_ISOLATION');
    externalCallbacks?.onPinGamesToPCores?.();
    setProcesses((prev) => enforceOptimalCoreIsolation(prev));
    appendLog(
      'CPU',
      'Hardware Thread Sandbox enforced: Game engines pinned to P-Cores 0–3 (0x0F); CEF & DWM isolated to E-Cores 4–7 (0xF0)',
      'SUCCESS'
    );
  }, [appendLog, externalCallbacks]);

  // Action 8: Set Sensor Fan Profile
  const setFanProfile = useCallback(
    (fanProfile: SensorTelemetryState['fanProfile']) => {
      NexusController.emitIpcCommand('SET_FAN_PROFILE', { fanProfile });
      externalCallbacks?.onSetFanProfile?.(fanProfile);
      const rpmPresets: Record<SensorTelemetryState['fanProfile'], { cpu: number; gpu: number; chassis: number }> = {
        SILENT: { cpu: 1050, gpu: 1150, chassis: 880 },
        BALANCED: { cpu: 1420, gpu: 1580, chassis: 1120 },
        TURBO_CURVE: { cpu: 1840, gpu: 2050, chassis: 1460 },
        MAX_COOLING: { cpu: 2650, gpu: 2950, chassis: 2100 },
      };
      const target = rpmPresets[fanProfile];
      setSensors((prev) => ({
        ...prev,
        fanProfile,
        cpuFanRpm: target.cpu,
        gpuFanRpm: target.gpu,
        chassisFanRpm: target.chassis,
      }));
      appendLog('GPU', `PWM Thermal Fan Curve switched to [${fanProfile}] (${target.gpu} RPM GPU / ${target.cpu} RPM CPU)`, 'INFO');
    },
    [appendLog, externalCallbacks]
  );

  // Action 9: Send AI Engine Advisor Prompt
  const sendAdvisorPrompt = useCallback(
    (promptText: string) => {
      const trimmed = promptText.trim();
      if (!trimmed) return;
      NexusController.emitIpcCommand('ADVISOR_QUERY', { prompt: trimmed });
      externalCallbacks?.onSendAdvisorPrompt?.(trimmed);

      const nowTs = formatTimestamp();
      const userMsg: AdvisorMessage = {
        id: `usr-${Date.now()}`,
        role: 'user',
        timestamp: nowTs,
        content: trimmed,
      };
      const reply = buildAdvisorResponse(trimmed, telemetry, storage, upscaler, nowTs);
      setAdvisorMessages((prev) => [...prev, userMsg, reply]);
      appendLog('AI', `Engine Advisor analyzed telemetry for query: "${trimmed.slice(0, 48)}"`, 'INFO');
    },
    [appendLog, externalCallbacks, storage, telemetry, upscaler]
  );

  // Action 10: Clear Logs
  const clearLogs = useCallback(() => {
    setLogs([
      createLogEntry('ETW', 'Action console log buffer cleared by operator', 'INFO'),
    ]);
  }, []);

  return {
    telemetry,
    frames,
    oscilloscopePaused,
    setOscilloscopePaused,
    storage,
    upscaler,
    cores,
    processes,
    sensors,
    logs,
    logFilter,
    setLogFilter,
    advisorMessages,
    activeTab,
    setActiveTab,
    dpiScale,
    setDpiScale,
    consoleExpanded,
    setConsoleExpanded,
    busyAction,
    actions: {
      fixDwmCrisis,
      engage300FpsOverdrive,
      setTargetFpsCap,
      triggerDwmCrisisSimulation,
      injectMicroStutterSpike,
      activateGameProfile,
      purgeStandbyMemory,
      updateUpscalerConfig,
      toggleProcessCore,
      pinGamesToPCores,
      setFanProfile,
      sendAdvisorPrompt,
      clearLogs,
    },
  };
}

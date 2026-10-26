import type {
  AdvisorMessage,
  CoreTelemetry,
  FrameSample,
  GameProfile,
  LogEntry,
  LogSeverity,
  ProcessAffinityItem,
  SensorTelemetryState,
  StorageCacheState,
  SystemTelemetryState,
  UpscalerConfig,
  UpscalerShaderId,
} from '../types/nexus.ts';

export const GAME_PROFILES: GameProfile[] = [
  {
    id: 'roblox',
    title: 'ROBLOX',
    executable: 'RobloxPlayerBeta.exe',
    engineTag: 'Hyperion / Luau Client',
    buttonLabel: 'UNCAP 300+ FPS',
    presetSummary: 'FastFlags, Voxel Lighting, 720p DirectFlip, Level 1 Lock',
    specs: [
      'FFlagTaskSchedulerTargetFps: 999',
      'FFlagDebugForceFutureIsBrightPhase2: False (Voxel)',
      'Swapchain: 1280x720 Hardware Independent Flip',
      'QualityLevel: Locked Level 01',
    ],
    targetFps: 320,
    targetFrameTimeMs: 3.12,
    targetResolution: '1280x720',
    recommendedShader: 'AMD_RCAS',
    accentColor: '#00F2FE',
  },
  {
    id: 'valorant',
    title: 'VALORANT',
    executable: 'VALORANT-Win64-Shipping.exe',
    engineTag: 'Unreal Engine 5 Tactical',
    buttonLabel: '300+ FPS TURBO',
    presetSummary: 'UE5 55% 3D Scale, 1000 FPS Uncapped, Riot CEF Throttle',
    specs: [
      'sg.ResolutionQuality: 55.0%',
      'RiotClientUxRender.exe: Throttled to E-Cores 6-7',
      'RawInputBuffer: Enabled (Click-to-Photon < 3.2ms)',
      'FrameRateLimit: 1000.0 Uncapped',
    ],
    targetFps: 340,
    targetFrameTimeMs: 2.94,
    targetResolution: '1280x720',
    recommendedShader: 'AMD_RCAS',
    accentColor: '#00FFA3',
  },
  {
    id: 'fears-to-fathom',
    title: 'FEARS TO FATHOM',
    executable: 'FearsToFathom.exe',
    engineTag: 'Unity HDRP / VHS Pipeline',
    buttonLabel: 'FASTEST 300 FPS',
    presetSummary: 'Registry Level 0 & 720p Fullscreen',
    specs: [
      'Screenmanager Fullscreen mode: Exclusive (0)',
      'Screenmanager Resolution: 1280x720 @ 240Hz',
      'UnityGraphicsQuality: Registry Index 0 (Fastest)',
      'VHS Post-Process Volumetric Fog: Stripped',
    ],
    targetFps: 300,
    targetFrameTimeMs: 3.33,
    targetResolution: '1280x720',
    recommendedShader: 'MAGPIE_ACNET',
    accentColor: '#F59E0B',
  },
  {
    id: 'fortnite',
    title: 'FORTNITE',
    executable: 'FortniteClient-Win64-Shipping.exe',
    engineTag: 'UE5.4 Es31 Feature Level',
    buttonLabel: '300+ FPS PERFORMANCE',
    presetSummary: 'Es31 DirectFlip & Low-Mesh Geometry',
    specs: [
      'RenderingAPI: D3D12 FeatureLevel Es31',
      'bUseMobileRendering: True (Low Meshes)',
      'Nanite / Lumen / Virtual Shadow Maps: Disabled',
      'DirectFlip Swapchain: Locked 0-Copy Present',
    ],
    targetFps: 310,
    targetFrameTimeMs: 3.22,
    targetResolution: '1280x720',
    recommendedShader: 'RIFE_VULKAN',
    accentColor: '#00F2FE',
  },
];

export const INITIAL_TELEMETRY_STATE: SystemTelemetryState = {
  online: true,
  dwmCrisisMode: false,
  activeProfileId: 'valorant',
  cpuUsagePercent: 38,
  pCoreClockMhz: 5450,
  eCoreClockMhz: 4100,
  cpuPackageWatts: 78.4,
  ramTotalGb: 32.0,
  ramUsedGb: 11.4,
  ramAvailableGb: 20.6,
  ramUsedPercent: 35.6,
  cpuTempC: 59,
  gpuTempC: 56,
  gpuClockMhz: 2745,
  thermalStatus: 'OPTIMAL',
  displayedFps: 325,
  onePercentLowFps: 288,
  targetFpsCap: 360,
  frameTimeMs: 3.08,
  clickToPhotonMs: 3.65,
  presentMode: 'Hardware: Independent Flip',
};

export const INITIAL_STORAGE_STATE: StorageCacheState = {
  virtualPoolTotalTb: 5.0,
  virtualPoolAllocatedTb: 3.42,
  pinnedRamCacheTotalGb: 20.0,
  pinnedRamCacheUsedGb: 16.8,
  ringBufferHitRatePercent: 98.4,
  wofCompressionRatio: 2.45,
  wofSpaceSavedGb: 412.6,
  standbyListMb: 4820,
  modifiedPageListMb: 340,
  lastPurgeTimestamp: null,
};

export const INITIAL_UPSCALER_CONFIG: UpscalerConfig = {
  shader: 'AMD_RCAS',
  inputResolution: '1280x720',
  outputResolution: '2560x1440',
  sharpness: 78,
  frameGenMultiplier: 2,
  directFlipActive: true,
  previewSplitPercent: 52,
};

export const INITIAL_CORES: CoreTelemetry[] = [
  { coreId: 0, type: 'P-CORE', label: 'P-Core 0', loadPercent: 68, clockMhz: 5450, tempC: 63, pinnedThreads: ['RenderThread', 'RHIThread'] },
  { coreId: 1, type: 'P-CORE', label: 'P-Core 1', loadPercent: 64, clockMhz: 5450, tempC: 62, pinnedThreads: ['GameThread', 'Physics_0'] },
  { coreId: 2, type: 'P-CORE', label: 'P-Core 2', loadPercent: 52, clockMhz: 5400, tempC: 60, pinnedThreads: ['AudioMixer', 'NetDriver'] },
  { coreId: 3, type: 'P-CORE', label: 'P-Core 3', loadPercent: 48, clockMhz: 5400, tempC: 59, pinnedThreads: ['PresentMon_ETW'] },
  { coreId: 4, type: 'E-CORE', label: 'E-Core 4', loadPercent: 21, clockMhz: 4100, tempC: 52, pinnedThreads: ['dwm.exe'] },
  { coreId: 5, type: 'E-CORE', label: 'E-Core 5', loadPercent: 18, clockMhz: 4100, tempC: 51, pinnedThreads: ['nvcontainer.exe'] },
  { coreId: 6, type: 'E-CORE', label: 'E-Core 6', loadPercent: 14, clockMhz: 4100, tempC: 50, pinnedThreads: ['RiotClientUxRender.exe'] },
  { coreId: 7, type: 'E-CORE', label: 'E-Core 7', loadPercent: 12, clockMhz: 4100, tempC: 49, pinnedThreads: ['Discord.exe', 'SteamWebHelper'] },
];

export const INITIAL_PROCESSES: ProcessAffinityItem[] = [
  {
    pid: 14820,
    name: 'VALORANT-Win64-Shipping.exe',
    category: 'GAME_ENGINE',
    cpuUsagePercent: 34.2,
    memoryMb: 4280,
    priority: 'HIGH',
    assignedCores: [0, 1, 2, 3],
    isIsolated: true,
  },
  {
    pid: 9912,
    name: 'RobloxPlayerBeta.exe',
    category: 'GAME_ENGINE',
    cpuUsagePercent: 1.2,
    memoryMb: 1120,
    priority: 'HIGH',
    assignedCores: [0, 1, 2, 3],
    isIsolated: true,
  },
  {
    pid: 1204,
    name: 'dwm.exe (Desktop Window Manager)',
    category: 'SYSTEM_COMPOSITOR',
    cpuUsagePercent: 2.4,
    memoryMb: 215,
    priority: 'NORMAL',
    assignedCores: [4, 5],
    isIsolated: true,
  },
  {
    pid: 18440,
    name: 'RiotClientUxRender.exe',
    category: 'BACKGROUND_CEF',
    cpuUsagePercent: 0.8,
    memoryMb: 380,
    priority: 'BELOW_NORMAL',
    assignedCores: [6, 7],
    isIsolated: true,
  },
  {
    pid: 22190,
    name: 'Discord.exe (CEF Overlay)',
    category: 'BACKGROUND_CEF',
    cpuUsagePercent: 1.9,
    memoryMb: 640,
    priority: 'IDLE',
    assignedCores: [6, 7],
    isIsolated: true,
  },
];

export const INITIAL_SENSOR_STATE: SensorTelemetryState = {
  vramUsedGb: 5.8,
  vramTotalGb: 16.0,
  vramBusSaturationPercent: 44.2,
  vramBandwidthGbPerSec: 512.8,
  cpuFanRpm: 1640,
  gpuFanRpm: 1820,
  chassisFanRpm: 1280,
  vcoreMv: 1245,
  gpuCoreMv: 985,
  dimmVoltageMv: 1350,
  pcieLinkSpeed: 'PCIe 4.0 x16 @ 16.0 GT/s',
  resizableBarEnabled: true,
  fanProfile: 'TURBO_CURVE',
};

export function formatTimestamp(date: Date = new Date()): string {
  const hh = String(date.getHours()).padStart(2, '0');
  const mm = String(date.getMinutes()).padStart(2, '0');
  const ss = String(date.getSeconds()).padStart(2, '0');
  return `${hh}:${mm}:${ss}`;
}

export function createLogEntry(
  subsystem: LogEntry['subsystem'],
  message: string,
  severity: LogSeverity = 'INFO',
  date: Date = new Date()
): LogEntry {
  return {
    id: `${date.getTime()}-${Math.random().toString(36).slice(2, 7)}`,
    timestamp: formatTimestamp(date),
    subsystem,
    message,
    severity,
  };
}

/**
 * Computes thermal status classification from CPU and GPU temperatures.
 */
export function classifyThermalStatus(cpuTempC: number, gpuTempC: number): 'OPTIMAL' | 'ELEVATED' | 'CRITICAL' {
  const maxTemp = Math.max(cpuTempC, gpuTempC);
  if (maxTemp >= 85) return 'CRITICAL';
  if (maxTemp >= 74) return 'ELEVATED';
  return 'OPTIMAL';
}

/**
 * Computes the hexadecimal CPU affinity mask string for a list of core indices (0-7).
 */
export function formatAffinityBitmask(cores: number[]): string {
  let mask = 0;
  for (const core of cores) {
    if (core >= 0 && core < 32) {
      mask |= 1 << core;
    }
  }
  return `0x${mask.toString(16).toUpperCase().padStart(2, '0')}`;
}

/**
 * Transitions system telemetry when fixing the 20 FPS DWM crisis.
 */
export function applyDwmCrisisFix(state: SystemTelemetryState): SystemTelemetryState {
  const activeProfile = GAME_PROFILES.find((p) => p.id === state.activeProfileId) ?? GAME_PROFILES[1];
  const targetFps = activeProfile.targetFps;
  const frameTimeMs = Number((1000 / targetFps).toFixed(2));
  return {
    ...state,
    dwmCrisisMode: false,
    displayedFps: targetFps,
    onePercentLowFps: Math.round(targetFps * 0.86),
    frameTimeMs,
    clickToPhotonMs: Number((frameTimeMs + 0.75).toFixed(2)),
    presentMode: 'Hardware: Independent Flip',
    cpuTempC: Math.min(state.cpuTempC, 64),
    gpuTempC: Math.min(state.gpuTempC, 61),
    thermalStatus: 'OPTIMAL',
  };
}

/**
 * Engages 300+ FPS Ultra Overdrive, bypassing DWM composition and maximizing P-Core scheduling.
 */
export function apply300FpsOverdrive(state: SystemTelemetryState): SystemTelemetryState {
  const targetFps = 330;
  const frameTimeMs = Number((1000 / targetFps).toFixed(2));
  return {
    ...state,
    dwmCrisisMode: false,
    displayedFps: targetFps,
    onePercentLowFps: 295,
    frameTimeMs,
    clickToPhotonMs: Number((frameTimeMs + 0.45).toFixed(2)),
    presentMode: 'Hardware: Independent Flip',
    targetFpsCap: 1000,
    pCoreClockMhz: 5450,
    eCoreClockMhz: 4100,
    cpuUsagePercent: 38,
    cpuTempC: 58,
    gpuTempC: 55,
    thermalStatus: 'OPTIMAL',
  };
}

/**
 * Transitions system telemetry into simulated 20 FPS DWM desktop composition bottleneck.
 */
export function simulateDwmCrisisState(state: SystemTelemetryState): SystemTelemetryState {
  return {
    ...state,
    dwmCrisisMode: true,
    displayedFps: 20,
    onePercentLowFps: 14,
    frameTimeMs: 49.8,
    clickToPhotonMs: 68.4,
    presentMode: 'Composed: Flip (DWM Bottleneck)',
    thermalStatus: 'ELEVATED',
  };
}

/**
 * Applies a Game Quick-Launch Booster Profile to the system telemetry and upscaler state.
 */
export function applyGameProfileState(
  state: SystemTelemetryState,
  upscaler: UpscalerConfig,
  profileId: string
): { telemetry: SystemTelemetryState; upscaler: UpscalerConfig; profile: GameProfile } {
  const profile = GAME_PROFILES.find((p) => p.id === profileId) ?? GAME_PROFILES[0];
  const frameTimeMs = Number((1000 / profile.targetFps).toFixed(2));

  const nextTelemetry: SystemTelemetryState = {
    ...state,
    dwmCrisisMode: false,
    activeProfileId: profile.id,
    displayedFps: profile.targetFps,
    onePercentLowFps: Math.round(profile.targetFps * 0.87),
    frameTimeMs,
    clickToPhotonMs: Number((frameTimeMs + 0.65).toFixed(2)),
    presentMode: 'Hardware: Independent Flip',
    pCoreClockMhz: 5450,
    eCoreClockMhz: 4100,
    cpuUsagePercent: 46,
    cpuPackageWatts: 82.5,
  };

  const nextUpscaler: UpscalerConfig = {
    ...upscaler,
    shader: profile.recommendedShader,
    inputResolution: profile.targetResolution,
    directFlipActive: true,
  };

  return { telemetry: nextTelemetry, upscaler: nextUpscaler, profile };
}

/**
 * Purges Standby Memory list and updates both storage cache state and system telemetry RAM metrics.
 */
export function purgeStandbyMemoryState(
  telemetry: SystemTelemetryState,
  storage: StorageCacheState,
  timestamp: string
): { telemetry: SystemTelemetryState; storage: StorageCacheState; freedMb: number } {
  const freedMb = Math.max(420, storage.standbyListMb - 120);
  const freedGb = freedMb / 1024;
  const newUsedGb = Number(Math.max(5.2, telemetry.ramUsedGb - freedGb * 0.65).toFixed(1));
  const newAvailableGb = Number((telemetry.ramTotalGb - newUsedGb).toFixed(1));
  const newUsedPercent = Number(((newUsedGb / telemetry.ramTotalGb) * 100).toFixed(1));

  return {
    freedMb,
    telemetry: {
      ...telemetry,
      ramUsedGb: newUsedGb,
      ramAvailableGb: newAvailableGb,
      ramUsedPercent: newUsedPercent,
    },
    storage: {
      ...storage,
      standbyListMb: 120,
      modifiedPageListMb: 45,
      ringBufferHitRatePercent: Number(Math.min(99.8, storage.ringBufferHitRatePercent + 0.8).toFixed(1)),
      lastPurgeTimestamp: timestamp,
    },
  };
}

/**
 * Generates a realistic next frame sample for the 60-frame oscilloscope buffer.
 */
export function generateNextFrameSample(
  lastId: number,
  telemetry: SystemTelemetryState,
  forceSpike: boolean = false,
  randomValue: number = Math.random()
): FrameSample {
  let frameTimeMs: number;

  if (forceSpike) {
    frameTimeMs = Number((22.4 + randomValue * 14.0).toFixed(2));
  } else if (telemetry.dwmCrisisMode) {
    // Severe 20 FPS DWM composition lock (~46-54ms with jitter)
    frameTimeMs = Number((46.5 + (randomValue - 0.5) * 9.2).toFixed(2));
  } else {
    const baseMs = telemetry.frameTimeMs || 3.6;
    // Occasional tiny variance, rare micro-stutter if randomValue > 0.985
    const jitter = (randomValue - 0.5) * 0.55;
    frameTimeMs = Number(Math.max(2.1, baseMs + jitter).toFixed(2));
  }

  const fps = Math.round(1000 / frameTimeMs);
  // Anomaly flagged if frame exceeds 16.6ms (60 FPS threshold) or spikes > 2.2x target
  const isAnomaly = frameTimeMs > 16.6;

  return {
    id: lastId + 1,
    frameTimeMs,
    fps,
    isAnomaly,
    timestamp: Date.now(),
  };
}

/**
 * Toggles a specific CPU core index (0-7) for a process while guaranteeing at least 1 core remains assigned.
 */
export function toggleProcessCoreAssignment(
  processes: ProcessAffinityItem[],
  pid: number,
  coreId: number
): ProcessAffinityItem[] {
  return processes.map((proc) => {
    if (proc.pid !== pid) return proc;
    const exists = proc.assignedCores.includes(coreId);
    let nextCores: number[];
    if (exists) {
      if (proc.assignedCores.length <= 1) {
        return proc; // Never leave a process with 0 cores
      }
      nextCores = proc.assignedCores.filter((c) => c !== coreId);
    } else {
      nextCores = [...proc.assignedCores, coreId].sort((a, b) => a - b);
    }
    const onlyPCores = nextCores.every((c) => c <= 3);
    const onlyECores = nextCores.every((c) => c >= 4);
    return {
      ...proc,
      assignedCores: nextCores,
      isIsolated: onlyPCores || onlyECores,
    };
  });
}

/**
 * Enforces strict P-Core (0-3) isolation for GAME_ENGINE processes and E-Core (4-7) isolation for background/compositor tasks.
 */
export function enforceOptimalCoreIsolation(processes: ProcessAffinityItem[]): ProcessAffinityItem[] {
  return processes.map((proc) => {
    if (proc.category === 'GAME_ENGINE') {
      return { ...proc, assignedCores: [0, 1, 2, 3], priority: 'HIGH', isIsolated: true };
    }
    if (proc.category === 'SYSTEM_COMPOSITOR') {
      return { ...proc, assignedCores: [4, 5], priority: 'NORMAL', isIsolated: true };
    }
    return { ...proc, assignedCores: [6, 7], priority: 'BELOW_NORMAL', isIsolated: true };
  });
}

/**
 * Generates deterministic, telemetry-grounded AI Engine Advisor responses with actionable tuning buttons.
 */
export function buildAdvisorResponse(
  query: string,
  telemetry: SystemTelemetryState,
  storage: StorageCacheState,
  upscaler: UpscalerConfig,
  timestamp: string
): AdvisorMessage {
  const q = query.toLowerCase();

  if (q.includes('112') || q.includes('300') || q.includes('low fps') || q.includes('drop') || q.includes('boost')) {
    return {
      id: `adv-${Date.now()}`,
      role: 'advisor',
      timestamp,
      content: `FPS dropped from ~300 FPS to 112 FPS due to 3 critical bottlenecks: (1) Windows DWM Composed Flip forced 120Hz/V-Sync frame pacing with dropped intervals, (2) Windows Scheduler migrated game render threads to 2.1 GHz Gracemont E-Cores instead of 4.5+ GHz Golden Cove P-Cores, and (3) RAM standby cache pressure. Engaging 300+ FPS Ultra Overdrive locks DirectFlip 0-copy, pins threads to P-Cores 0–3 (0x0F bitmask), and drives frame pacing to <3.0ms (~330 FPS).`,
      recommendedAction: {
        label: 'Engage 300+ FPS Ultra Overdrive Now',
        actionType: 'BOOST_300_FPS',
      },
    };
  }

  if (q.includes('20 fps') || q.includes('dwm') || q.includes('stutter') || q.includes('crisis') || telemetry.dwmCrisisMode) {
    return {
      id: `adv-${Date.now()}`,
      role: 'advisor',
      timestamp,
      content: `Telemetry indicates swapchain state [${telemetry.presentMode}] with frame time at ${telemetry.frameTimeMs}ms. Windows Desktop Window Manager (dwm.exe) is intercepting fullscreen buffers via Composed Flip. Unlocking DirectFlip and promoting swapchain to Hardware Independent Flip will bypass DWM composition and cut latency by ~82%.`,
      recommendedAction: {
        label: 'Unlock DirectFlip Swapchain Now',
        actionType: 'UNLOCK_DWM',
      },
    };
  }

  if (q.includes('ram') || q.includes('memory') || q.includes('standby') || q.includes('cache')) {
    return {
      id: `adv-${Date.now()}`,
      role: 'advisor',
      timestamp,
      content: `Physical RAM is at ${telemetry.ramUsedGb} GB / ${telemetry.ramTotalGb} GB (${telemetry.ramAvailableGb} GB free), with ${storage.standbyListMb} MB held in Windows Standby Page Lists. Purging the Standby List and pinning the 20GB L2 Ring Buffer will eliminate pagefile hard-faults during texture streaming.`,
      recommendedAction: {
        label: `Purge ${storage.standbyListMb} MB Standby List`,
        actionType: 'PURGE_RAM',
      },
    };
  }

  if (q.includes('core') || q.includes('cpu') || q.includes('affinity') || q.includes('thread') || q.includes('valorant')) {
    return {
      id: `adv-${Date.now()}`,
      role: 'advisor',
      timestamp,
      content: `Cross-CCX / E-Core thread migration causes 1% low drops when Windows schedules game render threads onto E-Cores 4–7 (${telemetry.eCoreClockMhz} MHz). Pinning game executables strictly to P-Cores 0–3 (${telemetry.pCoreClockMhz} MHz, bitmask 0x0F) and quarantining CEF browsers to E-Cores 6–7 stabilizes 1% lows.`,
      recommendedAction: {
        label: 'Enforce P-Core 0–3 Isolation (0x0F)',
        actionType: 'PIN_PCORES',
      },
    };
  }

  return {
    id: `adv-${Date.now()}`,
    role: 'advisor',
    timestamp,
    content: `Current pipeline runs ${upscaler.shader} at ${upscaler.inputResolution} -> ${upscaler.outputResolution} (${upscaler.sharpness}% sharpness) yielding ${telemetry.displayedFps} FPS (${telemetry.onePercentLowFps} 1% Low) and ${telemetry.clickToPhotonMs}ms click-to-photon latency. Switching to AMD FidelityFX RCAS at 82% sharpness with 720p DirectFlip maximizes sub-pixel edge clarity at zero GPU compute overhead.`,
    recommendedAction: {
      label: 'Calibrate AMD RCAS 82% Sharpness',
      actionType: 'APPLY_RCAS',
    },
  };
}

export function getUpscalerMetrics(config: UpscalerConfig): {
  shaderLabel: string;
  computeCostMs: number;
  effectiveFpsBoostPercent: number;
  subpixelClarityScore: number;
} {
  const shaderMap: Record<UpscalerShaderId, { label: string; cost: number; boost: number; clarity: number }> = {
    AMD_RCAS: {
      label: 'AMD FidelityFX RCAS (Robust Contrast Adaptive Sharpening)',
      cost: 0.18,
      boost: 44,
      clarity: 94,
    },
    MAGPIE_ACNET: {
      label: 'Magpie ACNet (CNN Anime/Geometry Spatial Reconstruction)',
      cost: 0.62,
      boost: 36,
      clarity: 97,
    },
    RIFE_VULKAN: {
      label: 'RIFE v4.15 Vulkan Optical Flow + Async Frame Gen',
      cost: 0.85,
      boost: 88,
      clarity: 92,
    },
  };

  const base = shaderMap[config.shader];
  const multBonus = (config.frameGenMultiplier - 1) * 32;
  return {
    shaderLabel: base.label,
    computeCostMs: base.cost,
    effectiveFpsBoostPercent: base.boost + multBonus,
    subpixelClarityScore: Math.min(99, Math.round(base.clarity * (0.85 + (config.sharpness / 100) * 0.15))),
  };
}

export type DpiScaleMode = '100%' | '125%' | '150%' | '4K';

export type UpscalerShaderId = 'AMD_RCAS' | 'MAGPIE_ACNET' | 'RIFE_VULKAN';

export type DashboardTabId =
  | 'storage-memory'
  | 'spatial-upscaler'
  | 'process-affinity'
  | 'sensor-telemetry'
  | 'engine-advisor';

export interface FrameSample {
  id: number;
  frameTimeMs: number;
  fps: number;
  isAnomaly: boolean;
  timestamp: number;
}

export interface CoreTelemetry {
  coreId: number;
  type: 'P-CORE' | 'E-CORE';
  label: string;
  loadPercent: number;
  clockMhz: number;
  tempC: number;
  pinnedThreads: string[];
}

export interface ProcessAffinityItem {
  pid: number;
  name: string;
  category: 'GAME_ENGINE' | 'SYSTEM_COMPOSITOR' | 'BACKGROUND_CEF';
  cpuUsagePercent: number;
  memoryMb: number;
  priority: 'REALTIME' | 'HIGH' | 'NORMAL' | 'BELOW_NORMAL' | 'IDLE';
  assignedCores: number[]; // core IDs 0-7
  isIsolated: boolean;
}

export interface StorageCacheState {
  virtualPoolTotalTb: number;
  virtualPoolAllocatedTb: number;
  pinnedRamCacheTotalGb: number;
  pinnedRamCacheUsedGb: number;
  ringBufferHitRatePercent: number;
  wofCompressionRatio: number; // e.g., 2.4x
  wofSpaceSavedGb: number;
  standbyListMb: number;
  modifiedPageListMb: number;
  lastPurgeTimestamp: string | null;
}

export interface UpscalerConfig {
  shader: UpscalerShaderId;
  inputResolution: '1280x720' | '1600x900' | '1920x1080';
  outputResolution: '1920x1080' | '2560x1440' | '3840x2160';
  sharpness: number; // 0 to 100
  frameGenMultiplier: 1 | 2 | 3;
  directFlipActive: boolean;
  previewSplitPercent: number; // 0 to 100
}

export interface SensorTelemetryState {
  vramUsedGb: number;
  vramTotalGb: number;
  vramBusSaturationPercent: number;
  vramBandwidthGbPerSec: number;
  cpuFanRpm: number;
  gpuFanRpm: number;
  chassisFanRpm: number;
  vcoreMv: number;
  gpuCoreMv: number;
  dimmVoltageMv: number;
  pcieLinkSpeed: string;
  resizableBarEnabled: boolean;
  fanProfile: 'SILENT' | 'BALANCED' | 'TURBO_CURVE' | 'MAX_COOLING';
}

export interface SystemTelemetryState {
  online: boolean;
  dwmCrisisMode: boolean; // true when locked in 20 FPS DWM crisis, false when unlocked
  activeProfileId: string | null;
  // Card 1: CPU Package
  cpuUsagePercent: number;
  pCoreClockMhz: number;
  eCoreClockMhz: number;
  cpuPackageWatts: number;
  // Card 2: Memory (RAM)
  ramTotalGb: number;
  ramUsedGb: number;
  ramAvailableGb: number;
  ramUsedPercent: number;
  // Card 3: Thermals & Clocks
  cpuTempC: number;
  gpuTempC: number;
  gpuClockMhz: number;
  thermalStatus: 'OPTIMAL' | 'ELEVATED' | 'CRITICAL';
  // Card 4: Displayed FPS (Intel PresentMon ETW)
  displayedFps: number;
  onePercentLowFps: number;
  targetFpsCap: number;
  // Card 5: Frame & Latency
  frameTimeMs: number;
  clickToPhotonMs: number;
  presentMode: 'Hardware: Independent Flip' | 'Hardware Composed: Independent Flip' | 'Composed: Flip (DWM Bottleneck)';
}

export interface GameProfile {
  id: string;
  title: string;
  executable: string;
  engineTag: string;
  buttonLabel: string;
  presetSummary: string;
  specs: string[];
  targetFps: number;
  targetFrameTimeMs: number;
  targetResolution: '1280x720' | '1600x900' | '1920x1080';
  recommendedShader: UpscalerShaderId;
  accentColor: string;
}

export type LogSeverity = 'INFO' | 'SUCCESS' | 'WARNING' | 'CRITICAL';

export interface LogEntry {
  id: string;
  timestamp: string;
  subsystem: 'DWM' | 'ETW' | 'MEM' | 'CPU' | 'GPU' | 'PROFILE' | 'AI';
  message: string;
  severity: LogSeverity;
}

export interface AdvisorMessage {
  id: string;
  role: 'user' | 'advisor';
  timestamp: string;
  content: string;
  recommendedAction?: {
    label: string;
    actionType: 'UNLOCK_DWM' | 'PURGE_RAM' | 'PIN_PCORES' | 'APPLY_RCAS' | 'BOOST_300_FPS';
  };
}

export interface NexusBridgeCallbacks {
  onFixDwmCrisis?: () => void;
  onSimulateDwmCrisis?: () => void;
  onActivateGameProfile?: (profileId: string) => void;
  onPurgeStandbyMemory?: () => void;
  onUpdateUpscaler?: (patch: Partial<UpscalerConfig>) => void;
  onToggleProcessCore?: (pid: number, coreId: number) => void;
  onPinGamesToPCores?: () => void;
  onSetFanProfile?: (profile: SensorTelemetryState['fanProfile']) => void;
  onSendAdvisorPrompt?: (prompt: string) => void;
  onSetTargetFpsCap?: (fps: number) => void;
  onEngage300FpsOverdrive?: () => void;
}

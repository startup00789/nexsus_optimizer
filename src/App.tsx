/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { TitleBar } from './components/TitleBar.tsx';
import { TelemetryRibbon } from './components/TelemetryRibbon.tsx';
import { FrameOscilloscope } from './components/FrameOscilloscope.tsx';
import { GameBoosterGrid } from './components/GameBoosterGrid.tsx';
import { ControlDashboard } from './components/ControlDashboard.tsx';
import { ActionConsoleDrawer } from './components/ActionConsoleDrawer.tsx';
import { useNexusBridge, NexusController } from './hooks/useNexusBridge.ts';

export type {
  SystemTelemetryState,
  GameProfile,
  LogEntry,
  NexusBridgeCallbacks,
} from './types/nexus.ts';
export { useNexusBridge, NexusController };

export default function App() {
  const {
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
    actions,
  } = useNexusBridge();

  const [isMinimized, setIsMinimized] = useState(false);
  const [isMaximized, setIsMaximized] = useState(true);

  const handleResetWorkspace = () => {
    setIsMinimized(false);
    setActiveTab('storage-memory');
    actions.fixDwmCrisis();
  };

  return (
    <div
      data-dpi-scale={dpiScale}
      className="min-h-screen bg-[#0B0F19] text-[#F8FAFC] flex flex-col justify-between selection:bg-[#00F2FE]/20 selection:text-[#00F2FE]"
    >
      {/* Borderless Desktop Window Titlebar */}
      <TitleBar
        dpiScale={dpiScale}
        onChangeDpiScale={setDpiScale}
        isMinimized={isMinimized}
        onToggleMinimize={() => setIsMinimized((prev) => !prev)}
        isMaximized={isMaximized}
        onToggleMaximize={() => setIsMaximized((prev) => !prev)}
        onResetWorkspace={handleResetWorkspace}
      />

      {/* Main High-DPI Workspace Container */}
      <main
        className={`w-full mx-auto px-4 sm:px-6 py-5 space-y-6 flex-1 transition-all ${
          isMaximized ? 'max-w-[1600px]' : 'max-w-[1280px]'
        }`}
      >
        {/* 1. Top Header & 5 Real-Time Metric Telemetry Ribbon + Emergency DWM Button */}
        <TelemetryRibbon
          telemetry={telemetry}
          busyAction={busyAction}
          onFixDwmCrisis={actions.fixDwmCrisis}
          onSimulateDwmCrisis={actions.triggerDwmCrisisSimulation}
          onEngage300FpsOverdrive={actions.engage300FpsOverdrive}
          onSetTargetFpsCap={actions.setTargetFpsCap}
        />

        {!isMinimized && (
          <>
            {/* 2. Real-Time Frame Pacing Oscilloscope (Interactive Canvas) */}
            <FrameOscilloscope
              frames={frames}
              paused={oscilloscopePaused}
              onTogglePause={() => setOscilloscopePaused((prev) => !prev)}
              onInjectSpike={actions.injectMicroStutterSpike}
              dwmCrisisMode={telemetry.dwmCrisisMode}
            />

            {/* 3. Game Quick-Launch Booster Grid */}
            <GameBoosterGrid
              activeProfileId={telemetry.activeProfileId}
              busyAction={busyAction}
              onActivateProfile={actions.activateGameProfile}
            />

            {/* 4. Tabbed Deep Control Dashboard */}
            <ControlDashboard
              activeTab={activeTab}
              onSelectTab={setActiveTab}
              telemetry={telemetry}
              storage={storage}
              upscaler={upscaler}
              cores={cores}
              processes={processes}
              sensors={sensors}
              advisorMessages={advisorMessages}
              busyAction={busyAction}
              onPurgeStandbyMemory={actions.purgeStandbyMemory}
              onUpdateUpscaler={actions.updateUpscalerConfig}
              onToggleProcessCore={actions.toggleProcessCore}
              onPinGamesToPCores={actions.pinGamesToPCores}
              onSetFanProfile={actions.setFanProfile}
              onSendAdvisorPrompt={actions.sendAdvisorPrompt}
              onFixDwmCrisis={actions.fixDwmCrisis}
              onEngage300FpsOverdrive={actions.engage300FpsOverdrive}
            />
          </>
        )}

        {/* 5. Live Action Console / Log Drawer */}
        <ActionConsoleDrawer
          logs={logs}
          expanded={consoleExpanded}
          onToggleExpand={() => setConsoleExpanded((prev) => !prev)}
          filter={logFilter}
          onChangeFilter={setLogFilter}
          onClearLogs={actions.clearLogs}
        />
      </main>
    </div>
  );
}

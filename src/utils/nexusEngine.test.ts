import test from 'node:test';
import assert from 'node:assert/strict';
import {
  INITIAL_PROCESSES,
  INITIAL_STORAGE_STATE,
  INITIAL_TELEMETRY_STATE,
  INITIAL_UPSCALER_CONFIG,
  apply300FpsOverdrive,
  applyDwmCrisisFix,
  applyGameProfileState,
  buildAdvisorResponse,
  classifyThermalStatus,
  enforceOptimalCoreIsolation,
  formatAffinityBitmask,
  generateNextFrameSample,
  getUpscalerMetrics,
  purgeStandbyMemoryState,
  simulateDwmCrisisState,
  toggleProcessCoreAssignment,
} from './nexusEngine.ts';

test('formatAffinityBitmask computes correct hex bitmask for P-Cores and E-Cores', () => {
  assert.equal(formatAffinityBitmask([0, 1, 2, 3]), '0x0F');
  assert.equal(formatAffinityBitmask([4, 5, 6, 7]), '0xF0');
  assert.equal(formatAffinityBitmask([0, 1, 2, 3, 4, 5, 6, 7]), '0xFF');
  assert.equal(formatAffinityBitmask([6, 7]), '0xC0');
});

test('classifyThermalStatus categorizes optimal, elevated, and critical temperatures', () => {
  assert.equal(classifyThermalStatus(60, 58), 'OPTIMAL');
  assert.equal(classifyThermalStatus(76, 65), 'ELEVATED');
  assert.equal(classifyThermalStatus(82, 88), 'CRITICAL');
});

test('simulateDwmCrisisState and applyDwmCrisisFix transition FPS and swapchain mode accurately', () => {
  const crisis = simulateDwmCrisisState(INITIAL_TELEMETRY_STATE);
  assert.equal(crisis.dwmCrisisMode, true);
  assert.equal(crisis.displayedFps, 20);
  assert.equal(crisis.presentMode, 'Composed: Flip (DWM Bottleneck)');
  assert.ok(crisis.frameTimeMs > 40);

  const unlocked = applyDwmCrisisFix(crisis);
  assert.equal(unlocked.dwmCrisisMode, false);
  assert.ok(unlocked.displayedFps >= 240);
  assert.equal(unlocked.presentMode, 'Hardware: Independent Flip');
  assert.ok(unlocked.frameTimeMs < 5.0);
});

test('applyGameProfileState applies game booster preset and updates upscaler config', () => {
  const { telemetry, upscaler, profile } = applyGameProfileState(
    INITIAL_TELEMETRY_STATE,
    INITIAL_UPSCALER_CONFIG,
    'roblox'
  );
  assert.equal(profile.id, 'roblox');
  assert.equal(telemetry.activeProfileId, 'roblox');
  assert.equal(telemetry.displayedFps, 320);
  assert.equal(upscaler.shader, 'AMD_RCAS');
  assert.equal(upscaler.inputResolution, '1280x720');
  assert.equal(upscaler.directFlipActive, true);
});

test('apply300FpsOverdrive locks swapchain to 330 FPS and sub-3.5ms frame pacing', () => {
  const boosted = apply300FpsOverdrive(INITIAL_TELEMETRY_STATE);
  assert.equal(boosted.displayedFps, 330);
  assert.equal(boosted.dwmCrisisMode, false);
  assert.ok(boosted.frameTimeMs < 3.5);
  assert.equal(boosted.presentMode, 'Hardware: Independent Flip');
});

test('purgeStandbyMemoryState frees standby RAM and increases available memory', () => {
  const { telemetry, storage, freedMb } = purgeStandbyMemoryState(
    INITIAL_TELEMETRY_STATE,
    INITIAL_STORAGE_STATE,
    '14:22:01'
  );
  assert.ok(freedMb > 4000);
  assert.ok(telemetry.ramAvailableGb > INITIAL_TELEMETRY_STATE.ramAvailableGb);
  assert.equal(storage.standbyListMb, 120);
  assert.equal(storage.lastPurgeTimestamp, '14:22:01');
});

test('generateNextFrameSample detects micro-stutter anomalies above 16.6ms', () => {
  const normalSample = generateNextFrameSample(10, INITIAL_TELEMETRY_STATE, false, 0.5);
  assert.equal(normalSample.id, 11);
  assert.equal(normalSample.isAnomaly, false);
  assert.ok(normalSample.frameTimeMs < 16.6);

  const spikeSample = generateNextFrameSample(11, INITIAL_TELEMETRY_STATE, true, 0.5);
  assert.equal(spikeSample.id, 12);
  assert.equal(spikeSample.isAnomaly, true);
  assert.ok(spikeSample.frameTimeMs > 16.6);
});

test('toggleProcessCoreAssignment updates core mask and prevents empty core assignment', () => {
  const updated = toggleProcessCoreAssignment(INITIAL_PROCESSES, 1204, 4);
  const dwm = updated.find((p) => p.pid === 1204)!;
  assert.deepEqual(dwm.assignedCores, [5]);

  // Attempting to remove the last remaining core (5) must retain [5]
  const preventedEmpty = toggleProcessCoreAssignment(updated, 1204, 5);
  const dwmAfter = preventedEmpty.find((p) => p.pid === 1204)!;
  assert.deepEqual(dwmAfter.assignedCores, [5]);
});

test('enforceOptimalCoreIsolation pins games to P-Cores 0-3 and background apps to E-Cores', () => {
  const scrambled = INITIAL_PROCESSES.map((p) => ({
    ...p,
    assignedCores: [0, 4],
    isIsolated: false,
  }));
  const isolated = enforceOptimalCoreIsolation(scrambled);
  const game = isolated.find((p) => p.category === 'GAME_ENGINE')!;
  const cef = isolated.find((p) => p.category === 'BACKGROUND_CEF')!;
  assert.deepEqual(game.assignedCores, [0, 1, 2, 3]);
  assert.deepEqual(cef.assignedCores, [6, 7]);
  assert.equal(game.isIsolated, true);
});

test('getUpscalerMetrics and buildAdvisorResponse return deterministic telemetry values', () => {
  const metrics = getUpscalerMetrics(INITIAL_UPSCALER_CONFIG);
  assert.ok(metrics.effectiveFpsBoostPercent > 0);
  assert.ok(metrics.subpixelClarityScore > 80);

  const response = buildAdvisorResponse(
    'Fix 20 FPS DWM crisis',
    INITIAL_TELEMETRY_STATE,
    INITIAL_STORAGE_STATE,
    INITIAL_UPSCALER_CONFIG,
    '14:25:00'
  );
  assert.equal(response.role, 'advisor');
  assert.equal(response.recommendedAction?.actionType, 'UNLOCK_DWM');
});

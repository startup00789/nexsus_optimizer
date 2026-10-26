import React from 'react';
import { Zap, Crosshair, Gamepad2, Rocket, Check } from 'lucide-react';
import { GAME_PROFILES } from '../utils/nexusEngine.ts';

interface GameBoosterGridProps {
  activeProfileId: string | null;
  busyAction: string | null;
  onActivateProfile: (profileId: string) => void;
}

function renderGameLogo(id: string) {
  switch (id) {
    case 'roblox':
      return (
        <svg viewBox="0 0 36 36" className="w-8 h-8 text-[#00F2FE]" fill="none" aria-hidden="true">
          <rect
            x="7"
            y="7"
            width="22"
            height="22"
            rx="3"
            transform="rotate(14 18 18)"
            stroke="currentColor"
            strokeWidth="2.5"
            fill="rgba(0,242,254,0.12)"
          />
          <rect
            x="14.5"
            y="14.5"
            width="7"
            height="7"
            transform="rotate(14 18 18)"
            fill="currentColor"
          />
        </svg>
      );
    case 'valorant':
      return (
        <svg viewBox="0 0 36 36" className="w-8 h-8 text-[#00FFA3]" fill="none" aria-hidden="true">
          <path
            d="M6 9L16 27H10.5L6 18.5V9ZM30 9L21.5 24H16.5L25 9H30Z"
            fill="currentColor"
          />
        </svg>
      );
    case 'fears-to-fathom':
      return (
        <svg viewBox="0 0 36 36" className="w-8 h-8 text-[#F59E0B]" fill="none" aria-hidden="true">
          <rect x="5" y="9" width="26" height="18" rx="2.5" stroke="currentColor" strokeWidth="2.2" />
          <circle cx="13" cy="18" r="3.2" stroke="currentColor" strokeWidth="2" />
          <circle cx="23" cy="18" r="3.2" stroke="currentColor" strokeWidth="2" />
          <path d="M16.2 18H19.8" stroke="currentColor" strokeWidth="2" />
        </svg>
      );
    default:
      return (
        <svg viewBox="0 0 36 36" className="w-8 h-8 text-[#00F2FE]" fill="none" aria-hidden="true">
          <path
            d="M12 7H25L23.5 13H17.5V16.5H22.5L21.5 22H17.5V29H12V7Z"
            fill="currentColor"
          />
        </svg>
      );
  }
}

function renderActionIcon(id: string) {
  switch (id) {
    case 'roblox':
      return <Zap className="w-3.5 h-3.5 shrink-0" />;
    case 'valorant':
      return <Crosshair className="w-3.5 h-3.5 shrink-0" />;
    case 'fears-to-fathom':
      return <Gamepad2 className="w-3.5 h-3.5 shrink-0" />;
    default:
      return <Rocket className="w-3.5 h-3.5 shrink-0" />;
  }
}

export const GameBoosterGrid: React.FC<GameBoosterGridProps> = ({
  activeProfileId,
  busyAction,
  onActivateProfile,
}) => {
  return (
    <section id="game-boosters" aria-label="Game Quick-Launch Booster Grid" className="space-y-3.5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h2 className="font-display text-sm sm:text-base font-bold tracking-wider uppercase text-[#F8FAFC]">
            Game Quick-Launch Booster Grid
          </h2>
          <p className="text-xs text-[#94A3B8] font-mono">
            1-Click Engine Swapchain Overrides · DirectFlip 0-Copy Lock · Process Thread Isolation
          </p>
        </div>
        <div className="text-xs font-mono text-[#94A3B8]">
          Active Preset:{' '}
          <span className="text-[#00FFA3] font-semibold uppercase">
            {activeProfileId ?? 'CUSTOM'}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {GAME_PROFILES.map((profile) => {
          const isActive = activeProfileId === profile.id;
          const isBusy = busyAction === `profile-${profile.id}`;

          return (
            <div
              key={profile.id}
              className={`p-4 rounded-xl bg-[#111827] border flex flex-col justify-between space-y-4 transition-all ${
                isActive
                  ? 'border-[#00F2FE] shadow-[0_0_15px_rgba(0,242,254,0.18)]'
                  : 'border-[#1F293D] hover:border-[#00F2FE]/50'
              }`}
            >
              <div className="space-y-3">
                {/* Header: Game Logo + Title */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-[#161F30] border border-[#1F293D] shrink-0">
                      {renderGameLogo(profile.id)}
                    </div>
                    <div>
                      <h3 className="font-display text-base font-bold tracking-wide text-[#F8FAFC]">
                        {profile.title}
                      </h3>
                      <p className="text-[11px] font-mono text-[#94A3B8]">
                        {profile.engineTag} · {profile.targetFps} FPS
                      </p>
                    </div>
                  </div>

                  {isActive ? (
                    <span className="text-[11px] font-mono font-semibold text-[#00FFA3] whitespace-nowrap">
                      ● ACTIVE
                    </span>
                  ) : null}
                </div>

                {/* Preset Summary Kicker */}
                <p className="text-xs font-medium text-[#F8FAFC] leading-relaxed">
                  {profile.presetSummary}
                </p>

                {/* Technical Spec Flags */}
                <div className="pt-2 border-t border-[#1F293D] space-y-1 text-[11px] font-mono text-[#94A3B8]">
                  {profile.specs.map((spec) => (
                    <div key={spec} className="truncate" title={spec}>
                      · {spec}
                    </div>
                  ))}
                </div>
              </div>

              {/* 1-Click Turbo Button */}
              <button
                type="button"
                onClick={() => onActivateProfile(profile.id)}
                disabled={isBusy}
                className={`w-full py-2.5 px-4 rounded-lg text-xs font-display font-bold tracking-wider uppercase flex items-center justify-center gap-2 transition-all whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-[#00FFA3] text-[#0B0F19] shadow-[0_0_15px_rgba(0,255,163,0.3)] hover:bg-[#34D399]'
                    : 'bg-[#00F2FE]/15 text-[#00F2FE] border border-[#00F2FE]/40 hover:bg-[#00F2FE] hover:text-[#0B0F19] hover:shadow-[0_0_15px_rgba(0,242,254,0.35)]'
                }`}
              >
                {isActive ? <Check className="w-3.5 h-3.5 shrink-0" /> : renderActionIcon(profile.id)}
                <span>
                  {isBusy
                    ? 'INJECTING PRESET...'
                    : isActive
                    ? `${profile.buttonLabel} (LOCKED)`
                    : profile.buttonLabel}
                </span>
              </button>
            </div>
          );
        })}
      </div>
    </section>
  );
};

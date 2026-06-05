/**
 * AudioToggle — mute / unmute button wired to useSettingsStore.
 */

'use client';

import { useSettingsStore } from '@/state';

interface AudioToggleProps {
  className?: string;
}

export function AudioToggle({ className = '' }: AudioToggleProps) {
  const audioEnabled = useSettingsStore((s) => s.audioEnabled);
  const setAudio = useSettingsStore((s) => s.setAudio);

  return (
    <button
      type="button"
      onClick={() => void setAudio(!audioEnabled)}
      aria-label={audioEnabled ? 'Silenciar' : 'Activar sonido'}
      className={[
        'flex items-center justify-center w-10 h-10 rounded-full',
        'transition-all duration-150 cursor-pointer',
        'border border-white/20 hover:border-white/50',
        audioEnabled ? 'text-white' : 'text-white/30',
        className,
      ].join(' ')}
    >
      <span aria-hidden className="text-xl leading-none">
        {audioEnabled ? '🔊' : '🔇'}
      </span>
    </button>
  );
}

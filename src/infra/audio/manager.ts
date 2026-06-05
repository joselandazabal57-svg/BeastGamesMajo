/**
 * AudioManager — singleton wrapper around HTMLAudioElement instances.
 *
 * Source of truth: docs/hltc-beast-games.md §B2.
 *
 * Behaviour contract:
 *  - play() is a no-op when disabled (mute) — never blocks, never throws.
 *  - play() captures autoplay-policy rejections silently. Browsers require
 *    a user gesture before audio can start; before the first gesture, calls
 *    log a one-time warn and continue.
 *  - preload() best-effort loads all 6 mp3s. Failed loads log and continue.
 *  - SSR / non-browser: every method is a safe no-op. The audio elements are
 *    created lazily inside ensureLoaded() which checks for `window`.
 */

import { type SoundId, SOUND_PATHS, ALL_SOUND_IDS } from './sounds';

class AudioManager {
  private elements: Partial<Record<SoundId, HTMLAudioElement>> = {};
  private enabled = true;
  private loaded = false;
  private warnedAutoplay = false;

  /** Lazily create the <audio> objects. Returns false in non-browser env. */
  private ensureLoaded(): boolean {
    if (typeof window === 'undefined') return false;
    if (this.loaded) return true;
    for (const id of ALL_SOUND_IDS) {
      try {
        const audio = new Audio(SOUND_PATHS[id]);
        audio.preload = 'auto';
        audio.addEventListener('error', () => {
          // Asset missing or failed to decode — don't crash, just warn once.
          console.warn(`[audio] Failed to load "${id}" at ${SOUND_PATHS[id]}`);
        });
        this.elements[id] = audio;
      } catch (err) {
        console.warn(`[audio] Could not create Audio for "${id}":`, err);
      }
    }
    this.loaded = true;
    return true;
  }

  /** Trigger eager preload. Safe to call multiple times. */
  preload(): void {
    if (!this.ensureLoaded()) return;
    for (const id of ALL_SOUND_IDS) {
      const a = this.elements[id];
      if (!a) continue;
      // load() forces the browser to start fetching even before first play.
      try {
        a.load();
      } catch {
        /* ignore */
      }
    }
  }

  /** Toggle mute. */
  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }

  isEnabled(): boolean {
    return this.enabled;
  }

  /** Play a sound. No-op if disabled, no audio elements, or autoplay blocked. */
  play(id: SoundId): void {
    if (!this.enabled) return;
    if (!this.ensureLoaded()) return;
    const a = this.elements[id];
    if (!a) return;
    try {
      // Rewind to start in case the same sound fires in quick succession.
      a.currentTime = 0;
    } catch {
      /* some browsers throw on uninitialized media */
    }
    const playPromise = a.play();
    if (playPromise && typeof playPromise.then === 'function') {
      playPromise.catch((err: unknown) => {
        if (!this.warnedAutoplay) {
          this.warnedAutoplay = true;
          console.warn(
            '[audio] Play rejected (likely autoplay policy). Will succeed after first user gesture.',
            err,
          );
        }
      });
    }
  }
}

/**
 * Process-wide singleton. Browser-side modules share one instance.
 */
export const audioManager = new AudioManager();

/**
 * useSettingsStore — audio toggle and onboarding flag, mirrored to Dexie.
 */

'use client';

import { create } from 'zustand';
import { settingsRepo } from '@/infra/db/repos';
import { audioManager } from '@/infra/audio/manager';

type SettingsState = {
  audioEnabled: boolean;
  hasOnboarded: boolean;
  loaded: boolean;
};

type SettingsActions = {
  loadFromDb: () => Promise<void>;
  setAudio: (enabled: boolean) => Promise<void>;
  markOnboarded: () => Promise<void>;
};

export const useSettingsStore = create<SettingsState & SettingsActions>(
  (set) => ({
    audioEnabled: true,
    hasOnboarded: false,
    loaded: false,

    async loadFromDb() {
      const s = await settingsRepo.get();
      audioManager.setEnabled(s.audioEnabled);
      set({
        audioEnabled: s.audioEnabled,
        hasOnboarded: s.hasOnboarded,
        loaded: true,
      });
    },

    async setAudio(enabled) {
      await settingsRepo.setAudio(enabled);
      audioManager.setEnabled(enabled);
      set({ audioEnabled: enabled });
    },

    async markOnboarded() {
      await settingsRepo.markOnboarded();
      set({ hasOnboarded: true });
    },
  }),
);

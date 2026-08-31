import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { ALGORITHM_OPTIONS } from '../utils/algorithms.js'

export const useSettingsStore = create(
  persist(
    (set) => ({
      // falls back to the first available algorithm if nothing's been chosen yet
      defaultAlgorithm: ALGORITHM_OPTIONS[0]?.value ?? '',
      setDefaultAlgorithm: (value) => set({ defaultAlgorithm: value }),
    }),
    { name: 'app-settings' } // localStorage key
  )
)
import { createStore, useStore } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

export interface DismissedUrgencyAlertsState {
  dismissedIds: string[]
  dismissAlert: (id: string) => void
}

const storage =
  typeof window !== 'undefined'
    ? createJSONStorage<DismissedUrgencyAlertsState>(() => sessionStorage)
    : undefined

export const dismissedUrgencyAlertsStore = createStore<DismissedUrgencyAlertsState>()(
  persist(
    (set) => ({
      dismissedIds: [],
      dismissAlert: (id) =>
        set((state) =>
          state.dismissedIds.includes(id)
            ? state
            : { dismissedIds: [...state.dismissedIds, id] }
        ),
    }),
    {
      name: 'nouns-builder-dismissed-urgency-alerts',
      storage,
      version: 1,
    }
  )
)

export function useDismissedUrgencyAlerts(): DismissedUrgencyAlertsState {
  return useStore(dismissedUrgencyAlertsStore)
}

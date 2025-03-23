/**
 * Global State Store
 *
 * This file implements a global state management solution using Zustand.
 * It provides a centralized store for application state.
 */

import { create } from "zustand"
import { persist } from "zustand/middleware"
import { immer } from "zustand/middleware/immer"

interface UserState {
  user: {
    id: string | null
    name: string | null
    email: string | null
    role: string | null
  }
  setUser: (user: UserState["user"]) => void
  clearUser: () => void
}

interface UIState {
  sidebarOpen: boolean
  theme: "light" | "dark" | "system"
  setSidebarOpen: (open: boolean) => void
  toggleSidebar: () => void
  setTheme: (theme: UIState["theme"]) => void
}

interface FilterState {
  dateRange: {
    from: Date | null
    to: Date | null
  }
  setDateRange: (range: FilterState["dateRange"]) => void
  clearDateRange: () => void
}

// Create the store with multiple slices
export const useStore = create<UserState & UIState & FilterState>()(
  persist(
    immer((set) => ({
      // User state
      user: {
        id: null,
        name: null,
        email: null,
        role: null,
      },
      setUser: (user) =>
        set((state) => {
          state.user = user
        }),
      clearUser: () =>
        set((state) => {
          state.user = {
            id: null,
            name: null,
            email: null,
            role: null,
          }
        }),

      // UI state
      sidebarOpen: false,
      theme: "system",
      setSidebarOpen: (open) =>
        set((state) => {
          state.sidebarOpen = open
        }),
      toggleSidebar: () =>
        set((state) => {
          state.sidebarOpen = !state.sidebarOpen
        }),
      setTheme: (theme) =>
        set((state) => {
          state.theme = theme
        }),

      // Filter state
      dateRange: {
        from: null,
        to: null,
      },
      setDateRange: (range) =>
        set((state) => {
          state.dateRange = range
        }),
      clearDateRange: () =>
        set((state) => {
          state.dateRange = {
            from: null,
            to: null,
          }
        }),
    })),
    {
      name: "memoright-store",
      partialize: (state) => ({
        theme: state.theme,
        dateRange: state.dateRange,
      }),
    },
  ),
)


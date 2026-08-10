import { createContext, useContext } from 'react'
import type { DashboardStats } from '@/lib/melis-api'

export interface DashboardDataCtxValue {
  stats: DashboardStats | null
}

export const DashboardDataContext = createContext<DashboardDataCtxValue>({ stats: null })

export function useDashboardData(): DashboardDataCtxValue {
  return useContext(DashboardDataContext)
}

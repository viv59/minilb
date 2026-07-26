import { create } from "zustand";
import { statisticsApi } from "../api/statisticsApi";

export const useStatisticsStore = create((set,get) => ({
    stats: {},
    loading: false,
    error: null,

    fetchStatistics: async () => {
        set({loading: true, error: null})
        try {
            const stats = await statisticsApi.list()
            set({stats, loading: false})
        } catch (err){
            set({error: err.message ?? 'Failed to fetch stats', loading: false})
        }
    }

}))
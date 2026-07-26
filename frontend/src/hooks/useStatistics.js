import { useStatisticsStore } from "../store/statisticsStore";

export function useStatistics() {
    const stats = useStatisticsStore((s) => s.stats)
    const loading = useStatisticsStore((s) => s.loading)
    const error = useStatisticsStore((s) => s.error)
    const fetchStatistics = useStatisticsStore((s) => s.fetchStatistics)

    return {stats, loading, error,fetchStatistics}
}
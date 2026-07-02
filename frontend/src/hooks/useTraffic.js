import { useMemo } from 'react'
import { useServers } from './useServers.js'
import { DONUT_COLORS } from '../utils/constants.js'

export function useTraffic() {
  const { servers } = useServers()

  const totalRequests = useMemo(() => servers.reduce((sum, s) => sum + s.reqMin, 0), [servers])

  const distribution = useMemo(() => {
    const total = totalRequests || 1
    let acc = 0
    return servers.map((s, i) => {
      const pct = (s.reqMin / total) * 100
      const start = acc
      acc += pct
      return {
        id: s.id,
        name: s.name,
        color: DONUT_COLORS[i % DONUT_COLORS.length],
        pct: pct.toFixed(1),
        start,
        end: acc,
      }
    })
  }, [servers, totalRequests])

  return { totalRequests, distribution }
}

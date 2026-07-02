import { useEffect, useRef, useState } from 'react'
import { easeOutQuad } from '../services/animations.js'

export function useCountUp(target, durationMs = 600) {
  const [value, setValue] = useState(target)
  const fromRef = useRef(target)

  useEffect(() => {
    const from = fromRef.current
    const start = performance.now()
    let raf

    function tick(now) {
      const t = Math.min(1, (now - start) / durationMs)
      setValue(Math.round(from + (target - from) * easeOutQuad(t)))
      if (t < 1) raf = requestAnimationFrame(tick)
      else fromRef.current = target
    }

    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [target, durationMs])

  return value
}

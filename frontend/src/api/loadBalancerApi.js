import { api } from './axios.js'

export const loadBalancerApi = {
  getAlgorithm: () => api.get('/load-balancer/algorithm').then((r) => r.data),
  setAlgorithm: (algorithmId) => api.put('/load-balancer/algorithm', { algorithmId }).then((r) => r.data),
  getTrafficStats: () => api.get('/load-balancer/traffic').then((r) => r.data),
}

import { api } from "./axios";

export const statisticsApi = {
    list: () => api.get(`/stats/`).then((r) => r.data),
}
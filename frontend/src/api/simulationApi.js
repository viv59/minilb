import { api } from "./axios";

export const simulationApi = {
    create: (payload) => api.post("/simulations/", payload).then((r) => r.data),
    list: () => api.get("/simulations/").then((r) => r.data),
    get: (id) => api.get(`/simulations/${id}`).then((r) => r.data),
    start: (id) => api.post(`/simulations/${id}/start`).then((r) => r.data),
    stop: (id) => api.post(`/simulations/${id}/stop`).then((r) => r.data),
    getLogs: (id) => api.get(`/simulations/${id}/logs`).then((r) => r.data),
    deleteLogs: (id) =>
        api.delete(`/simulations/${id}/logs`).then((r) => r.data),
    remove: (id) => api.delete(`/simulations/${id}`).then((r) => r.data)
};

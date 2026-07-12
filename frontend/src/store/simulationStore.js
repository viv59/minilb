import { create } from "zustand";
import { simulationApi } from "../api/simulationApi.js";
import { SimulationSocket } from "../services/simulationSocket.js";

let socketInstance = null;

function sumRequests(traffic_waves = []) {
    return traffic_waves.reduce((sum, w) => sum + (w.requests ?? 0), 0);
}

export const useSimulationStore = create((set, get) => ({
    simulations: [],
    activeSimulation: null,
    status: null,
    distribution: {},
    totalPlanned: 0,
    processed: 0,
    currentWave: null,
    summary: null,
    lastRoutedEvent: null,
    loading: false,
    error: null,

    fetchSimulations: async () => {
        set({ loading: true, error: null });
        try {
            const simulations = await simulationApi.list();
            set({ simulations, loading: false });
        } catch (err) {
            set({
                error: err.message ?? "Failed to load simulations",
                loading: false,
            });
        }
    },

    createSimulation: async (payload) => {
        const sim = await simulationApi.create(payload);
        set((state) => ({
            simulations: [...state.simulations, sim],
            activeSimulation: sim,
            status: sim.status,
            distribution: {},
            totalPlanned: sumRequests(sim.traffic_waves),
            processed: 0,
            currentWave: null,
            summary: null,
            lastRoutedEvent: null,
        }));
        return sim;
    },

    startSimulation: async (id) => {
        await simulationApi.start(id);

        // Find the simulation in the list and set it as active
        set((state) => {
            const sim = state.simulations.find((s) => s.id === id);
            return {
                status: "RUNNING",
                activeSimulation: sim || { id },
                distribution: {},
                totalPlanned: sim ? sumRequests(sim.traffic_waves) : 0,
                processed: 0,
                currentWave: null,
                summary: null,
                lastRoutedEvent: null,
            };
        });

        get().connectSocket(id);
    },

    stopSimulation: async (id) => {
        await simulationApi.stop(id);
        set({
            status: "STOPPED",
        });
        get().disconnectSocket();
    },

    connectSocket: (id) => {
        get().disconnectSocket();
        const socket = new SimulationSocket(id);
        socketInstance = socket;

        socket.subscribe((event) => {
            if (event.event === "request_routed") {
                set({
                    distribution: event.distribution,
                    processed: event.total_processed,
                    currentWave: event.wave,
                    lastRoutedEvent: event,
                });
            } else if (event.event === "wave_completed") {
                set({
                    currentWave: event.wave,
                    totalPlanned: event.total_requests,
                });
            } else if (event.event === "simulation_completed") {
                set((state) => ({
                    status: event.status,
                    summary: event.summary,
                    distribution:
                        event.summary?.distribution ?? state.distribution,
                    processed: event.summary?.total_requests ?? state.processed,
                }));
                get().disconnectSocket();
            }
        });

        socket.connect();
    },

    disconnectSocket: () => {
        socketInstance?.disconnect();
        socketInstance = null;
    },

    clearActiveSimulation: () => {
        set({
            activeSimulation: null,
            status: null,
            distribution: {},
            totalPlanned: 0,
            processed: 0,
            currentWave: null,
            summary: null,
            lastRoutedEvent: null,
        });
        get().disconnectSocket();
    },

    removeSimulation: async (id) => {
        try {
            await simulationApi.remove(id);

            set((state) => ({
                simulations: state.simulations.filter((s) => s.id !== id),
            }));
        } catch (err) {
            console.error(err);
        }
    },

}));

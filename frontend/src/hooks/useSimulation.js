import { useSimulationStore } from "../store/simulationStore.js";

export function useSimulation() {
    const simulations = useSimulationStore((s) => s.simulations);
    const activeSimulation = useSimulationStore((s) => s.activeSimulation);
    const status = useSimulationStore((s) => s.status);
    const distribution = useSimulationStore((s) => s.distribution);
    const totalPlanned = useSimulationStore((s) => s.totalPlanned);
    const processed = useSimulationStore((s) => s.processed);
    const currentWave = useSimulationStore((s) => s.currentWave);
    const summary = useSimulationStore((s) => s.summary);
    const lastRoutedEvent = useSimulationStore((s) => s.lastRoutedEvent);
    const loading = useSimulationStore((s) => s.loading);
    const error = useSimulationStore((s) => s.error);

    const fetchSimulations = useSimulationStore((s) => s.fetchSimulations);
    const createSimulation = useSimulationStore((s) => s.createSimulation);
    const startSimulation = useSimulationStore((s) => s.startSimulation);
    const stopSimulation = useSimulationStore((s) => s.stopSimulation);
    const clearActiveSimulation = useSimulationStore(
        (s) => s.clearActiveSimulation,
    );

    return {
        simulations,
        activeSimulation,
        status,
        distribution,
        totalPlanned,
        processed,
        currentWave,
        summary,
        lastRoutedEvent,
        loading,
        error,
        fetchSimulations,
        createSimulation,
        startSimulation,
        stopSimulation,
        clearActiveSimulation,
    };
}

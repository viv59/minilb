import { create } from "zustand";

export const useToastStore = create((set) => ({
    toasts: [],

    showToast: ({ title, message, variant = "info" }) => {
        const id = Date.now();

        set((state) => ({
            toasts: [
                ...state.toasts,
                { id, title, message, variant },
            ],
        }));

        setTimeout(() => {
            set((state) => ({
                toasts: state.toasts.filter((t) => t.id !== id),
            }));
        }, 2300);
    },

    removeToast: (id) =>
        set((state) => ({
            toasts: state.toasts.filter((t) => t.id !== id),
        })),
}));
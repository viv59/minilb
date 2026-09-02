import { useEffect } from "react";
import { RouterProvider } from "react-router-dom";
import { router } from "./routes.jsx";
import { ThemeProvider } from "./context/ThemeContext.jsx";
import { ServerUIProvider } from "./context/ServerContext.jsx";
import { useAuthStore } from "./store/authStore.js";

import Toast from "./components/common/Toast";
import ToastContainer from "./components/common/ToastContainer";
import { useToastStore } from "./store/ToastStore";

export default function App() {
    const { toasts, removeToast } = useToastStore();
    const initialize = useAuthStore((s) => s.initialize);

    useEffect(() => {
        initialize();
    }, [initialize]);

    return (
        <ThemeProvider>
            <ServerUIProvider>

                <RouterProvider router={router} />

                <ToastContainer>
                    {toasts.map((toast) => (
                        <Toast
                            key={toast.id}
                            {...toast}
                            onClose={() => removeToast(toast.id)}
                        />
                    ))}
                </ToastContainer>

            </ServerUIProvider>
        </ThemeProvider>
    );
}
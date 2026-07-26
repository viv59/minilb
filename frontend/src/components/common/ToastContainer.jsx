export default function ToastContainer({ children }) {
    return (
        <div className="fixed top-6 right-6 z-[9999] flex w-96 flex-col gap-3 pointer-events-none">
            {children}
        </div>
    );
}
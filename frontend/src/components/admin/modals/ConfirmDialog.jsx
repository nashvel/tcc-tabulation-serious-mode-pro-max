import { AlertTriangle } from 'lucide-react';

export default function ConfirmDialog({
    isOpen,
    onClose,
    onConfirm,
    title = "Confirm Action",
    message = "Are you sure you want to proceed?",
    confirmText = "Confirm",
    cancelText = "Cancel",
    variant = "danger" // "danger" or "warning"
}) {
    if (!isOpen) return null;

    const iconBgColor = variant === "danger" ? "bg-red-500/10" : "bg-amber-500/10";
    const iconColor = variant === "danger" ? "text-red-500" : "text-amber-500";
    const confirmButtonColor = variant === "danger" ? "text-red-600" : "text-amber-600";

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm">
            <div className="w-full max-w-sm flex flex-col bg-white/80 backdrop-blur-2xl border border-white/50 rounded-2xl shadow-2xl overflow-hidden">
                <div className="p-6 text-center">
                    <div className={`mx-auto flex h-12 w-12 items-center justify-center rounded-full ${iconBgColor}`}>
                        <AlertTriangle className={`${iconColor}`} size={24} />
                    </div>
                    <h3 className="mt-4 text-lg font-semibold text-gray-900">{title}</h3>
                    <p className="mt-2 text-sm text-gray-600">{message}</p>
                </div>
                <div className="grid grid-cols-2 gap-px bg-gray-200">
                    <button
                        onClick={onClose}
                        className="h-12 text-sm font-medium bg-white/80 text-gray-600 hover:bg-white transition-colors"
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={() => {
                            onConfirm();
                            onClose();
                        }}
                        className={`h-12 text-sm font-semibold bg-white/80 ${confirmButtonColor} hover:bg-white transition-colors`}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
}

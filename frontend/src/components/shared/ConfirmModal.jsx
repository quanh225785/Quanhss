import React from "react";
import Modal from "./Modal";
import { AlertCircle, CheckCircle, Info, AlertTriangle } from "lucide-react";

const ConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Xác nhận",
  cancelText = "Hủy",
  variant = "default",
  isLoading = false,
}) => {
  const handleConfirm = () => {
    onConfirm();
  };

  const variantConfig = {
    default: {
      icon: Info,
      iconColor: "text-zinc-600",
      iconBg: "bg-zinc-500/10",
      confirmClass:
        "bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20 disabled:opacity-50",
    },
    danger: {
      icon: AlertCircle,
      iconColor: "text-red-600",
      iconBg: "bg-red-500/10",
      confirmClass:
        "bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-500/20 disabled:opacity-50",
    },
    warning: {
      icon: AlertTriangle,
      iconColor: "text-amber-600",
      iconBg: "bg-amber-500/10",
      confirmClass:
        "bg-amber-600 hover:bg-amber-700 text-white shadow-lg shadow-amber-500/20 disabled:opacity-50",
    },
    success: {
      icon: CheckCircle,
      iconColor: "text-emerald-600",
      iconBg: "bg-emerald-500/10",
      confirmClass:
        "bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-500/20 disabled:opacity-50",
    },
  };

  const config = variantConfig[variant] || variantConfig.default;
  const Icon = config.icon;

  const footer = (
    <>
      <button
        onClick={onClose}
        disabled={isLoading}
        className="px-6 py-2.5 text-sm font-bold text-zinc-700 bg-white border border-zinc-200 rounded-xl hover:bg-zinc-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
      >
        {cancelText}
      </button>
      <button
        onClick={handleConfirm}
        disabled={isLoading}
        className={`px-6 py-2.5 text-sm font-bold rounded-xl transition-all ${config.confirmClass}`}
      >
        {isLoading ? "Đang xử lý..." : confirmText}
      </button>
    </>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      footer={footer}
      size="sm"
      closeOnOverlay={!isLoading}
    >
      <div className="flex gap-4 p-2">
        <div
          className={`flex-shrink-0 w-12 h-12 rounded-2xl ${config.iconBg} flex items-center justify-center`}
        >
          <Icon className={`w-6 h-6 ${config.iconColor}`} />
        </div>
        <div className="flex-1">
          <p className="text-base text-zinc-600 font-medium leading-relaxed">{message}</p>
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmModal;

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
      iconBg: "bg-zinc-100",
      confirmClass:
        "bg-zinc-900 hover:bg-zinc-800 text-white disabled:opacity-50",
    },
    danger: {
      icon: AlertCircle,
      iconColor: "text-red-600",
      iconBg: "bg-red-100",
      confirmClass:
        "bg-red-600 hover:bg-red-700 text-white disabled:opacity-50",
    },
    warning: {
      icon: AlertTriangle,
      iconColor: "text-amber-600",
      iconBg: "bg-amber-100",
      confirmClass:
        "bg-amber-600 hover:bg-amber-700 text-white disabled:opacity-50",
    },
    success: {
      icon: CheckCircle,
      iconColor: "text-emerald-600",
      iconBg: "bg-emerald-100",
      confirmClass:
        "bg-emerald-600 hover:bg-emerald-700 text-white disabled:opacity-50",
    },
  };

  const config = variantConfig[variant] || variantConfig.default;
  const Icon = config.icon;

  const footer = (
    <>
      <button
        onClick={onClose}
        disabled={isLoading}
        className="px-4 py-2 text-sm font-medium text-zinc-700 bg-white border border-zinc-300 rounded-md hover:bg-zinc-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {cancelText}
      </button>
      <button
        onClick={handleConfirm}
        disabled={isLoading}
        className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${config.confirmClass}`}
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
      <div className="flex gap-4">
        <div
          className={`flex-shrink-0 w-10 h-10 rounded-full ${config.iconBg} flex items-center justify-center`}
        >
          <Icon className={`w-5 h-5 ${config.iconColor}`} />
        </div>
        <div className="flex-1">
          <p className="text-sm text-zinc-600">{message}</p>
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmModal;

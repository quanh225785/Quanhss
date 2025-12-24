import React, { useEffect } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  footer,
  size = "md",
  closeOnOverlay = true,
}) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
    "2xl": "max-w-2xl",
    "4xl": "max-w-4xl",
    "5xl": "max-w-5xl",
    "6xl": "max-w-6xl",
  };

  const modalContent = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={closeOnOverlay ? onClose : undefined}
      />

      {/* Modal Content */}
      <div
        className={`relative bg-white/80 backdrop-blur-xl rounded-[2rem] border border-white/40 shadow-2xl w-full ${sizeClasses[size]} mx-4 animate-in fade-in zoom-in duration-300`}
      >
        {title && (
          <div className="flex items-center justify-between px-8 py-6 border-b border-white/20">
            <h2 className="text-xl font-bold text-zinc-900">{title}</h2>
            <button
              onClick={onClose}
              className="p-2 rounded-xl hover:bg-black/5 transition-colors"
              aria-label="Close modal"
            >
              <X className="w-6 h-6 text-zinc-500" />
            </button>
          </div>
        )}

        {/* Body */}
        <div className="px-6 py-4">{children}</div>

        {/* Footer */}
        {footer && (
          <div className="flex items-center justify-end gap-3 px-8 py-6 border-t border-white/20 bg-black/5 rounded-b-[2rem]">
            {footer}
          </div>
        )}
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default Modal;

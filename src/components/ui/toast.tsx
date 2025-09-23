"use client";

import { useState, useEffect } from "react";
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

export interface Toast {
  id: string;
  title?: string;
  description?: string;
  variant?: 'default' | 'destructive' | 'success' | 'warning';
}

interface ToastProps extends Toast {
  onDismiss: (id: string) => void;
}

const variantConfig = {
  default: {
    icon: Info,
    iconColor: "text-blue-600",
    bgColor: "bg-white",
    borderColor: "border-gray-200",
    textColor: "text-gray-900",
  },
  success: {
    icon: CheckCircle,
    iconColor: "text-green-600",
    bgColor: "bg-green-50",
    borderColor: "border-green-200",
    textColor: "text-green-900",
  },
  destructive: {
    icon: AlertCircle,
    iconColor: "text-red-600",
    bgColor: "bg-red-50",
    borderColor: "border-red-200",
    textColor: "text-red-900",
  },
  warning: {
    icon: AlertTriangle,
    iconColor: "text-yellow-600",
    bgColor: "bg-yellow-50",
    borderColor: "border-yellow-200",
    textColor: "text-yellow-900",
  },
};

export function Toast({ id, title, description, variant = 'default', onDismiss }: ToastProps) {
  const [isVisible, setIsVisible] = useState(false);
  const config = variantConfig[variant];
  const Icon = config.icon;

  useEffect(() => {
    // 애니메이션을 위한 지연
    const timer = setTimeout(() => setIsVisible(true), 10);
    return () => clearTimeout(timer);
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    setTimeout(() => onDismiss(id), 300); // 애니메이션 완료 후 제거
  };

  return (
    <div
      className={cn(
        "fixed top-4 right-4 z-50 w-80 max-w-sm transform transition-all duration-300 ease-in-out",
        isVisible ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"
      )}
    >
      <div
        className={cn(
          "rounded-lg border shadow-lg p-4",
          config.bgColor,
          config.borderColor
        )}
      >
        <div className="flex items-start space-x-3">
          <Icon className={cn("h-5 w-5 mt-0.5 flex-shrink-0", config.iconColor)} />
          <div className="flex-1 min-w-0">
            {title && (
              <p className={cn("text-sm font-medium", config.textColor)}>
                {title}
              </p>
            )}
            {description && (
              <p className={cn("text-sm mt-1", config.textColor, title ? "opacity-90" : "")}>
                {description}
              </p>
            )}
          </div>
          <button
            onClick={handleDismiss}
            className={cn(
              "flex-shrink-0 p-1 rounded-md hover:bg-black/5 transition-colors",
              config.textColor
            )}
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

interface ToastContainerProps {
  toasts: Toast[];
  onDismiss: (id: string) => void;
}

export function ToastContainer({ toasts, onDismiss }: ToastContainerProps) {
  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          {...toast}
          onDismiss={onDismiss}
        />
      ))}
    </div>
  );
}

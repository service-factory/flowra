"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertTriangle, CheckCircle, Info, XCircle } from "lucide-react";

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "default" | "destructive" | "warning" | "info";
  onConfirm: () => void;
  onCancel?: () => void;
}

const variantConfig = {
  default: {
    icon: Info,
    iconColor: "text-blue-600",
    iconBg: "bg-blue-100",
    confirmButton: "bg-blue-600 hover:bg-blue-700",
  },
  destructive: {
    icon: XCircle,
    iconColor: "text-red-600",
    iconBg: "bg-red-100",
    confirmButton: "bg-red-600 hover:bg-red-700",
  },
  warning: {
    icon: AlertTriangle,
    iconColor: "text-yellow-600",
    iconBg: "bg-yellow-100",
    confirmButton: "bg-yellow-600 hover:bg-yellow-700",
  },
  info: {
    icon: CheckCircle,
    iconColor: "text-green-600",
    iconBg: "bg-green-100",
    confirmButton: "bg-green-600 hover:bg-green-700",
  },
};

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmText = "확인",
  cancelText = "취소",
  variant = "default",
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const config = variantConfig[variant];
  const Icon = config.icon;

  const handleConfirm = async () => {
    setIsLoading(true);
    try {
      await onConfirm();
      onOpenChange(false);
    } catch (error) {
      console.error("Confirm action failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    onCancel?.();
    onOpenChange(false);
  };

  // ESC 키로 닫기
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && open) {
        onCancel?.();
        onOpenChange(false);
      }
    };

    if (open) {
      document.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, onCancel, onOpenChange]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-full ${config.iconBg} dark:bg-gray-800`}>
              <Icon className={`h-5 w-5 ${config.iconColor} dark:text-gray-300`} />
            </div>
            <div>
              <DialogTitle className="text-lg font-semibold text-gray-900 dark:text-white">
                {title}
              </DialogTitle>
              {description && (
                <DialogDescription className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {description}
                </DialogDescription>
              )}
            </div>
          </div>
        </DialogHeader>

        <DialogFooter className="flex items-center justify-end space-x-2 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            disabled={isLoading}
          >
            {cancelText}
          </Button>
          <Button
            type="button"
            onClick={handleConfirm}
            disabled={isLoading}
            className={`text-white ${config.confirmButton}`}
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                처리 중...
              </>
            ) : (
              confirmText
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// 편의를 위한 훅
export function useConfirmDialog() {
  const [open, setOpen] = useState(false);
  const [config, setConfig] = useState<{
    title: string;
    description?: string;
    confirmText?: string;
    cancelText?: string;
    variant?: "default" | "destructive" | "warning" | "info";
    onConfirm: () => void | Promise<void>;
    onCancel?: () => void;
  } | null>(null);

  const confirm = (options: {
    title: string;
    description?: string;
    confirmText?: string;
    cancelText?: string;
    variant?: "default" | "destructive" | "warning" | "info";
    onConfirm: () => void | Promise<void>;
    onCancel?: () => void;
  }) => {
    setConfig(options);
    setOpen(true);
  };

  const ConfirmDialogComponent = config ? (
    <ConfirmDialog
      open={open}
      onOpenChange={setOpen}
      title={config.title}
      description={config.description}
      confirmText={config.confirmText}
      cancelText={config.cancelText}
      variant={config.variant}
      onConfirm={config.onConfirm}
      onCancel={config.onCancel}
    />
  ) : null;

  return { confirm, ConfirmDialogComponent };
}

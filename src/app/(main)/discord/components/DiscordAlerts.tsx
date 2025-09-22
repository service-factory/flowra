import { memo } from 'react';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, XCircle } from "lucide-react";

interface DiscordAlertsProps {
  error: string | null;
  success: string | null;
}

export const DiscordAlerts = memo(function DiscordAlerts({
  error,
  success,
}: DiscordAlertsProps) {
  if (!error && !success) {
    return null;
  }

  return (
    <div className="space-y-4">
      {error && (
        <Alert variant="destructive" className="mb-6">
          <XCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="mb-6">
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}
    </div>
  );
});

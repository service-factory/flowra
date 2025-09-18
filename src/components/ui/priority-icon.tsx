import { Triangle, Square, Circle } from "lucide-react";

interface PriorityIconProps {
  priority: string;
  className?: string;
}

export function PriorityIcon({ priority, className = "h-3 w-3 fill-current" }: PriorityIconProps) {
  switch (priority) {
    case "high":
      return <Triangle className={className} />;
    case "medium":
      return <Square className={className} />;
    case "low":
      return <Circle className={className} />;
    default:
      return <Circle className={className} />;
  }
}

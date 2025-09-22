import { memo } from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users } from "lucide-react";
import { RoleStat } from '../types/team';
import { TeamFiltersSkeleton } from './TeamLoadingSkeleton';

interface TeamFiltersProps {
  roleStats: RoleStat[];
  selectedRole: string;
  isLoading?: boolean;
  onRoleChange: (role: string) => void;
}

export const TeamFilters = memo(function TeamFilters({
  roleStats,
  selectedRole,
  isLoading = false,
  onRoleChange,
}: TeamFiltersProps) {
  if (isLoading) {
    return <TeamFiltersSkeleton />;
  }

  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">역할별 필터:</span>
          {roleStats.map((role) => (
            <Button
              key={role.value}
              variant={selectedRole === role.value ? "default" : "outline"}
              size="sm"
              onClick={() => onRoleChange(role.value)}
              className="transition-all duration-200"
            >
              {role.value === 'all' ? (
                <Users className="h-4 w-4 mr-1.5" />
              ) : (
                <Badge className={`mr-1.5 ${role.color}`}>
                  {role.count}
                </Badge>
              )}
              {role.label}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
});

import { memo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import TaskCreateModal from "@/components/task-create-modal";
import { 
  Plus,
  Calendar,
  Users
} from "lucide-react";
import Link from "next/link";

interface QuickActionsProps {
  onTaskCreate: () => void;
}

export const QuickActions = memo(function QuickActions({ onTaskCreate }: QuickActionsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>빠른 작업</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <TaskCreateModal 
          key="task-create-modal-in-dashboard"
          onTaskCreate={onTaskCreate}
          trigger={
            <Button className="w-full justify-start" variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              새 업무 생성
            </Button>
          }
        />
        <Link href="/calendar" className="block">
          <Button className="w-full justify-start" variant="outline">
            <Calendar className="h-4 w-4 mr-2" />
            일정 확인
          </Button>
        </Link>
        <Link href="/team" className="block">
          <Button className="w-full justify-start" variant="outline">
            <Users className="h-4 w-4 mr-2" />
            팀원 초대
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
});

"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertCircle, Palette, Plus, Send } from "lucide-react";
import { useToastContext } from "./toast-provider";

interface ProjectCreateModalProps {
  teamId?: string;
  trigger?: React.ReactNode;
  onCreated?: (project: any) => void;
}

export function ProjectCreateModal({ teamId, trigger, onCreated }: ProjectCreateModalProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [color, setColor] = useState("#3B82F6");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToastContext();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!teamId) return;
    setIsSubmitting(true);
    setError(null);
    try {
      const { createClient } = await import("@/lib/supabase/client");
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) throw new Error("세션 토큰이 없습니다");

      const res = await fetch(`/api/projects`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ team_id: teamId, name, description, color })
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "프로젝트 생성 실패");
      }
      const response = await res.json();
      const project = response.data;
      
      onCreated?.(project);
      
      // 폼 리셋
      setName("");
      setDescription("");
      
      // 모달 바로 닫기
      setOpen(false);
      
      // Toast 메시지 표시
      toast({
        title: "프로젝트 생성 완료",
        description: "프로젝트가 성공적으로 생성되었습니다!",
        variant: "success"
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "프로젝트 생성 실패");
    } finally {
      setIsSubmitting(false);
    }
  };

  const defaultTrigger = (
    <Button size="sm" variant="outline" className="border-gray-300 dark:border-gray-600">
      <Plus className="h-4 w-4 mr-2" /> 프로젝트 생성
    </Button>
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || defaultTrigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[520px] p-0">
        <div className="p-6">
          <DialogHeader className="mb-4">
            <DialogTitle className="text-lg font-semibold">새 프로젝트 만들기</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">프로젝트 이름 *</label>
              <Input value={name} onChange={(e) => setName(e.target.value)} required placeholder="예: 웹사이트 리뉴얼" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">설명</label>
              <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center"><Palette className="h-4 w-4 mr-2" /> 색상</label>
              <Input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="h-10 w-20 p-1" />
            </div>
            {error && (
              <div className="flex items-center space-x-2 text-red-600 bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
                <AlertCircle className="h-4 w-4" />
                <span className="text-sm">{error}</span>
              </div>
            )}
            
            <div className="flex justify-end space-x-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>취소</Button>
              <Button type="submit" disabled={!name.trim() || isSubmitting} className="bg-blue-600 hover:bg-blue-700">
                {isSubmitting ? "생성 중..." : (<><Send className="h-4 w-4 mr-2" /> 생성</>)}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}



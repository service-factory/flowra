import { useSearchParams, useRouter } from 'next/navigation';
import { useCallback } from 'react';

export type ViewMode = "kanban" | "list";

export function useViewMode() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // URL에서 view 파라미터 읽기, 기본값은 kanban
  const viewMode = (searchParams.get('view') as ViewMode) || 'kanban';

  const setViewMode = useCallback((mode: ViewMode) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('view', mode);
    router.push(`?${params.toString()}`);
  }, [searchParams, router]);

  return {
    viewMode,
    setViewMode,
  };
}

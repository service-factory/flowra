"use client";

import { Button } from "@/components/ui/button";
import { Check, X } from "lucide-react";

interface Props {
  allTags: string[];
  selectedTags: string[];
  onToggle: (tag: string) => void;
  onClear: () => void;
  getTagColor: (tag: string) => string;
}

export function TagFilterPanel({ allTags, selectedTags, onToggle, onClear, getTagColor }: Props) {
  return (
    <div className="mt-3 p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-gray-900 dark:text-white">태그로 필터링</h3>
        {selectedTags.length > 0 && (
          <Button variant="ghost" size="sm" onClick={onClear} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 h-6 px-2">
            <X className="h-3 w-3 mr-1" /> 모두 해제
          </Button>
        )}
      </div>
      <div className="flex flex-wrap gap-1.5">
        {allTags.map((tag) => (
          <button key={tag} onClick={() => onToggle(tag)} className={`px-2.5 py-1 text-xs rounded-full font-medium border transition-all duration-200 hover:scale-105 ${selectedTags.includes(tag) ? `${getTagColor(tag)} ring-1 ring-blue-500/50` : 'bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-600'}`}>
            {tag}
            {selectedTags.includes(tag) && (<Check className="h-3 w-3 ml-1 inline" />)}
          </button>
        ))}
      </div>
      {selectedTags.length > 0 && (
        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-2">
            <span className="text-xs text-gray-500 dark:text-gray-400">선택된 태그:</span>
            {selectedTags.map((tag) => (
              <span key={tag} className={`px-2 py-1 text-xs rounded-full font-medium border ${getTagColor(tag)}`}>{tag}</span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}



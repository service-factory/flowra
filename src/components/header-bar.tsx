"use client";

import { Logo } from "@/components/ui/logo";
import { Button } from "@/components/ui/button";
import { ReactNode } from "react";
import { Calendar, Settings, Users, BarChart3 } from "lucide-react";

interface HeaderBarProps {
  title: string;
  subtitle?: string;
  rightActions?: ReactNode;
}

export function HeaderBar({ title, subtitle, rightActions }: HeaderBarProps) {
  return (
    <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
      <div className="px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-3">
              <Logo size="sm" variant="default" />
              <div>
                <h1 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h1>
                {subtitle && (
                  <p className="text-xs text-gray-500 dark:text-gray-400">{subtitle}</p>
                )}
              </div>
            </div>
            <nav className="hidden sm:flex items-center space-x-1">
              <Button variant="ghost" size="sm" className="h-8 px-3 text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-700">
                <BarChart3 className="h-4 w-4 mr-1.5" /> 대시보드
              </Button>
              <Button variant="ghost" size="sm" className="h-8 px-3 text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-700">
                <Calendar className="h-4 w-4 mr-1.5" /> 캘린더
              </Button>
              <Button variant="ghost" size="sm" className="h-8 px-3 text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-700">
                <Users className="h-4 w-4 mr-1.5" /> 팀원
              </Button>
              <Button variant="ghost" size="sm" className="h-8 px-3 text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-700">
                <Settings className="h-4 w-4 mr-1.5" /> 설정
              </Button>
            </nav>
          </div>
          <div className="flex items-center space-x-2">{rightActions}</div>
        </div>
      </div>
    </header>
  );
}



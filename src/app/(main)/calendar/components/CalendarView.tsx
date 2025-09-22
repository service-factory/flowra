"use client";

import { memo, useState } from 'react';
import { Calendar as CalendarIcon, Plus } from "lucide-react";
import { DndContext, useDroppable } from "@dnd-kit/core";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CalendarTask, ViewMode, TasksByDate } from '../types/calendar';
import { DraggableTaskCard } from './DraggableTaskCard';
import { getPriorityIcon, getStatusText } from '../utils/calendarUtils';
import { 
  CalendarGridSkeleton, 
  CalendarWeekSkeleton, 
  CalendarDaySkeleton 
} from './CalendarLoadingSkeleton';

interface CalendarViewProps {
  currentDate: Date;
  viewMode: ViewMode;
  tasksByDate: TasksByDate;
  onTaskClick: (task: CalendarTask) => void;
  onTaskMove: (taskId: string, newDueDate: string) => void;
  openTaskCreateModal?: (opts?: { initialStatus?: string; initialDueDate?: string }) => void;
  isLoading?: boolean;
  isRefreshing?: boolean;
}


// 드롭 가능한 날짜 셀 컴포넌트 (구글 캘린더 스타일)
function DroppableDateCell({ 
  date, 
  dateKey, 
  isCurrentMonth, 
  isTodayDate, 
  dayTasks, 
  onTaskClick, 
  openTaskCreateModal
}: {
  date: Date;
  dateKey: string;
  isCurrentMonth: boolean;
  isTodayDate: boolean;
  dayTasks: CalendarTask[];
  onTaskClick: (task: CalendarTask) => void;
  openTaskCreateModal?: (opts?: { initialStatus?: string; initialDueDate?: string }) => void;
}) {
  const { isOver, setNodeRef } = useDroppable({
    id: dateKey,
  });

  const [showAllTasks, setShowAllTasks] = useState(false);
  const maxVisibleTasks = 4; // 구글 캘린더처럼 더 많은 일정을 표시
  const visibleTasks = showAllTasks ? dayTasks : dayTasks.slice(0, maxVisibleTasks);
  const remainingCount = dayTasks.length - maxVisibleTasks;

  return (
    <div
      ref={setNodeRef}
      className={`h-full border-r border-b border-gray-200 dark:border-gray-700 p-1.5 relative flex flex-col ${
        !isCurrentMonth ? 'bg-gray-50/50 dark:bg-gray-900/30' : 'bg-white dark:bg-gray-800'
      } ${isTodayDate ? 'bg-blue-50 dark:bg-blue-950/20' : ''} ${
        isOver ? 'bg-blue-100/50 dark:bg-blue-900/30' : ''
      } hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors`}
    >
      {/* 날짜 헤더 */}
      <div className="flex items-center justify-between mb-1 group">
        <span
          className={`text-sm font-medium ${
            !isCurrentMonth ? 'text-gray-400 dark:text-gray-600' :
            isTodayDate ? 'text-blue-600 dark:text-blue-400 font-bold bg-blue-100 dark:bg-blue-900/50 rounded-full w-6 h-6 flex items-center justify-center' :
            'text-gray-900 dark:text-white'
          }`}
        >
          {date.getDate()}
        </span>
        {isCurrentMonth && (
          <Button
            variant="ghost"
            size="sm"
            className="h-5 w-5 p-0 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-blue-100 dark:hover:bg-blue-900 rounded-full"
            onClick={() => openTaskCreateModal?.({ initialDueDate: dateKey })}
          >
            <Plus className="h-3 w-3" />
          </Button>
        )}
      </div>

      {/* 태스크 목록 */}
      <div className="flex-1 space-y-0.5 overflow-y-auto">
        {visibleTasks.map((task) => (
          <DraggableTaskCard
            key={task.id}
            task={task}
            onTaskClick={onTaskClick}
            isCompact={true}
          />
        ))}
        
        {/* 더보기 버튼 */}
        {dayTasks.length > maxVisibleTasks && !showAllTasks && (
          <button
            onClick={() => setShowAllTasks(true)}
            className="w-full text-xs text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded px-1 py-0.5 transition-colors"
          >
            +{remainingCount}개 더보기
          </button>
        )}
        
        {/* 접기 버튼 */}
        {showAllTasks && dayTasks.length > maxVisibleTasks && (
          <button
            onClick={() => setShowAllTasks(false)}
            className="w-full text-xs text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded px-1 py-0.5 transition-colors"
          >
            접기
          </button>
        )}
      </div>
    </div>
  );
}

export const CalendarView = memo(function CalendarView({
  currentDate,
  viewMode,
  tasksByDate,
  onTaskClick,
  onTaskMove,
  openTaskCreateModal,
  isLoading = false,
  isRefreshing = false,
}: CalendarViewProps) {
  const isToday = (date: Date) => {
    const today = new Date();
    return date.getFullYear() === today.getFullYear() &&
      date.getMonth() === today.getMonth() &&
      date.getDate() === today.getDate();
  };

  const isSameMonth = (date: Date) => {
    return date.getMonth() === currentDate.getMonth() &&
      date.getFullYear() === currentDate.getFullYear();
  };

  const formatDateKey = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days: Date[] = [];
    
    // 이전 달의 마지막 날들
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      const prevDate = new Date(year, month, -i);
      days.push(prevDate);
    }
    
    // 현재 달의 날들
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    
    // 다음 달의 첫 날들 (42개 셀을 채우기 위해)
    const remainingDays = 42 - days.length;
    for (let day = 1; day <= remainingDays; day++) {
      days.push(new Date(year, month + 1, day));
    }
    
    return days;
  };

  const getWeekDays = (date: Date) => {
    const startOfWeek = new Date(date);
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1); // 월요일 시작
    startOfWeek.setDate(diff);
    
    const days: Date[] = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      days.push(day);
    }
    
    return days;
  };

  const handleDragEnd = (event: { active: { id: string | number }; over: { id: string | number } | null }) => {
    const { active, over } = event;
    
    if (active && over && active.id !== over.id) {
      onTaskMove(String(active.id), String(over.id));
    }
  };

  const renderMonthView = () => {
    const days = getDaysInMonth(currentDate);
    const weekDays = ['일', '월', '화', '수', '목', '금', '토'];

    return (
      <DndContext onDragEnd={handleDragEnd}>
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden shadow-sm flex-1 flex flex-col">
          {/* 요일 헤더 - 구글 캘린더 스타일 */}
          <div className="grid grid-cols-7 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 flex-shrink-0">
            {weekDays.map((day, index) => (
              <div
                key={day}
                className={`p-2 text-center text-xs font-medium ${
                  index === 0 ? 'text-red-600 dark:text-red-400' : 
                  index === 6 ? 'text-blue-600 dark:text-blue-400' : 
                  'text-gray-600 dark:text-gray-400'
                }`}
              >
                {day}
              </div>
            ))}
          </div>

          {/* 날짜 그리드 - 구글 캘린더 스타일 */}
          <div className="grid grid-cols-7 flex-1">
            {days.map((date, index) => {
              const dateKey = formatDateKey(date);
              const dayTasks = tasksByDate[dateKey] || [];
              const isCurrentMonth = isSameMonth(date);
              const isTodayDate = isToday(date);

              return (
                <DroppableDateCell
                  key={index}
                  date={date}
                  dateKey={dateKey}
                  isCurrentMonth={isCurrentMonth}
                  isTodayDate={isTodayDate}
                  dayTasks={dayTasks}
                  onTaskClick={onTaskClick}
                  openTaskCreateModal={openTaskCreateModal}
                />
              );
            })}
          </div>
        </div>
      </DndContext>
    );
  };

  const renderWeekView = () => {
    const weekDays = getWeekDays(currentDate);
    const weekDaysNames = ['월', '화', '수', '목', '금', '토', '일'];

    return (
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden shadow-sm flex-1 flex flex-col">
        {/* 요일 헤더 - 구글 캘린더 스타일 */}
        <div className="grid grid-cols-7 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 flex-shrink-0">
          {weekDaysNames.map((day, index) => (
            <div
              key={day}
              className={`p-2 text-center text-xs font-medium ${
                index === 6 ? 'text-red-600 dark:text-red-400' : 
                'text-gray-600 dark:text-gray-400'
              }`}
            >
              {day}
            </div>
          ))}
        </div>

        {/* 시간대와 날짜 그리드 - 구글 캘린더 스타일 */}
        <div className="grid grid-cols-7 flex-1">
          {weekDays.map((date, index) => {
            const dateKey = formatDateKey(date);
            const dayTasks = tasksByDate[dateKey] || [];
            const isTodayDate = isToday(date);

            return (
              <div
                key={index}
                className={`h-full border-r border-gray-200 dark:border-gray-700 p-2 flex flex-col ${
                  isTodayDate ? 'bg-blue-50 dark:bg-blue-950/20' : 'bg-white dark:bg-gray-800'
                } hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors`}
              >
                <div className="flex items-center justify-between mb-2 group">
                  <span
                    className={`text-sm font-medium ${
                      isTodayDate ? 'text-blue-600 dark:text-blue-400 font-bold bg-blue-100 dark:bg-blue-900/50 rounded-full w-6 h-6 flex items-center justify-center' :
                      'text-gray-900 dark:text-white'
                    }`}
                  >
                    {date.getDate()}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-5 w-5 p-0 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-blue-100 dark:hover:bg-blue-900 rounded-full"
                    onClick={() => openTaskCreateModal?.({ initialDueDate: dateKey })}
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>

                {/* 태스크 목록 - 구글 캘린더 스타일 */}
                <div className="flex-1 space-y-1 overflow-y-auto">
                  {dayTasks.map((task) => (
                    <DraggableTaskCard
                      key={task.id}
                      task={task}
                      onTaskClick={onTaskClick}
                      isCompact={true}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderDayView = () => {
    const dateKey = formatDateKey(currentDate);
    const dayTasks = tasksByDate[dateKey] || [];
    const isTodayDate = isToday(currentDate);

    return (
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden shadow-sm flex-1 flex flex-col">
        {/* 날짜 헤더 - 구글 캘린더 스타일 */}
        <div className={`p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 ${
          isTodayDate ? 'bg-blue-50 dark:bg-blue-950/20' : ''
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <h3 className={`text-lg font-semibold ${
                isTodayDate ? 'text-blue-600 dark:text-blue-400' : 'text-gray-900 dark:text-white'
              }`}>
                {currentDate.getFullYear()}년 {currentDate.getMonth() + 1}월 {currentDate.getDate()}일
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {dayTasks.length}개의 업무
              </p>
            </div>
            <Button
              className="bg-blue-600 hover:bg-blue-700"
              onClick={() => openTaskCreateModal?.({ initialDueDate: dateKey })}
            >
              새 업무
            </Button>
          </div>
        </div>

        {/* 태스크 목록 - 구글 캘린더 스타일 */}
        <div className="p-4">
          {dayTasks.length > 0 ? (
            <div className="space-y-3">
              {dayTasks.map((task) => (
                <div
                  key={task.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    onTaskClick(task);
                  }}
                  className={`p-4 rounded-lg cursor-pointer hover:shadow-md transition-all duration-200 border-l-4 ${
                    task.status === "completed" ? "bg-green-50 border-green-500 hover:bg-green-100" :
                    task.status === "in_progress" ? "bg-blue-50 border-blue-500 hover:bg-blue-100" :
                    task.status === "pending" ? "bg-gray-50 border-gray-400 hover:bg-gray-100" :
                    "bg-red-50 border-red-500 hover:bg-red-100"
                  } dark:bg-gray-800/50 dark:hover:bg-gray-700/50`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm">{getPriorityIcon(task.priority)}</span>
                      <h4 className="font-medium text-gray-900 dark:text-white">{task.title}</h4>
                    </div>
                    <Badge 
                      variant="outline" 
                      className={`text-xs ${
                        task.status === "completed" ? "border-green-500 text-green-700" :
                        task.status === "in_progress" ? "border-blue-500 text-blue-700" :
                        task.status === "pending" ? "border-gray-400 text-gray-700" :
                        "border-red-500 text-red-700"
                      }`}
                    >
                      {getStatusText(task.status)}
                    </Badge>
                  </div>
                  
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                    {task.description}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-6 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
                        <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                          {task.assignee?.name?.charAt(0) || "?"}
                        </span>
                      </div>
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {task.assignee?.name || "미할당"}
                      </span>
                    </div>
                    
                    {task.tags && task.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {task.tags.slice(0, 3).map((tag) => (
                          <Badge key={typeof tag === 'string' ? tag : tag.id} variant="secondary" className="text-xs px-2 py-0">
                            {typeof tag === 'string' ? tag : tag.tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <CalendarIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                이 날에는 업무가 없습니다
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                새로운 업무를 추가하거나 다른 날짜를 확인해보세요.
              </p>
              <Button
                className="bg-blue-600 hover:bg-blue-700"
                onClick={() => openTaskCreateModal?.({ initialDueDate: dateKey })}
              >
                새 업무
              </Button>
            </div>
          )}
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="h-full flex flex-col">
        {viewMode === "month" && <CalendarGridSkeleton />}
        {viewMode === "week" && <CalendarWeekSkeleton />}
        {viewMode === "day" && <CalendarDaySkeleton />}
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col relative">
      {isRefreshing && (
        <div className="absolute top-2 right-2 z-10">
          <div className="bg-blue-500 text-white px-2 py-1 rounded-md text-xs flex items-center space-x-1">
            <div className="animate-spin h-3 w-3 border border-white border-t-transparent rounded-full"></div>
            <span>새로고침 중...</span>
          </div>
        </div>
      )}
      {viewMode === "month" && renderMonthView()}
      {viewMode === "week" && renderWeekView()}
      {viewMode === "day" && renderDayView()}
    </div>
  );
});

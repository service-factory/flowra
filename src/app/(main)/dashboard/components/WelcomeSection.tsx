import { memo } from 'react';

export const WelcomeSection = memo(function WelcomeSection() {
  return (
    <div className="mb-8">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
        안녕하세요! 👋
      </h1>
      <p className="text-gray-600 dark:text-gray-400">
        오늘도 팀과 함께 조화롭게 업무를 진행해보세요.
      </p>
    </div>
  );
});

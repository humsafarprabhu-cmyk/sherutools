import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Free Pomodoro Timer - Focus Timer Online',
  description: 'Stay focused with the Pomodoro technique. 25-minute work sessions, customizable timers, browser notifications, daily stats tracking.',
  keywords: ['pomodoro timer', 'focus timer', 'pomodoro online', 'study timer', 'productivity timer'],
  alternates: { canonical: 'https://sherutools.com/pomodoro' },
};

export default function PomodoroLayout({ children }: { children: React.ReactNode }) {
  return children;
}

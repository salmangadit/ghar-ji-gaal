import type { ReactNode } from 'react';

interface AppShellProps {
  children: ReactNode;
}

/**
 * Outer shell that constrains to a mobile viewport (430px max-width),
 * centers on desktop, and handles iOS safe-area insets.
 */
export function AppShell({ children }: AppShellProps) {
  return (
    <div className="flex justify-center min-h-[100dvh] bg-gray-100">
      <div
        className="relative w-full max-w-[430px] min-h-[100dvh] bg-bg flex flex-col overflow-hidden shadow-xl"
        style={{ backgroundColor: 'var(--color-bg)' }}
      >
        {children}
      </div>
    </div>
  );
}

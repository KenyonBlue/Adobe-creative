import { ReactNode } from 'react';

interface LayoutProps {
  sidebar: ReactNode;
  canvas: ReactNode;
  insights: ReactNode;
}

export default function Layout({ sidebar, canvas, insights }: LayoutProps) {
  return (
    <div className="flex h-screen flex-col overflow-hidden bg-studio-bg">
      {/* Ambient background */}
      <div className="pointer-events-none fixed inset-0 bg-mesh-gradient" />
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(59,130,246,0.06)_0%,_transparent_50%)]" />

      <div className="relative flex flex-1 overflow-hidden">
        {sidebar}

        <main className="flex flex-1 flex-col overflow-hidden px-8 py-6">
          {canvas}
        </main>

        {insights}
      </div>
    </div>
  );
}

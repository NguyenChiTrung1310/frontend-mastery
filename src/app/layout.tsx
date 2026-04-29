import type { Metadata } from 'next';
import './globals.css';

import { Sidebar } from '@/components/layout/sidebar';
import { MswProvider } from '@/mocks/msw-provider';
import { getGroupedChallenges } from '@/registry/challenges';

export const metadata: Metadata = {
  title: 'Frontend Mastery — Local Learning Platform',
  description:
    'Solve JS, TS, React, Next.js, and DSA challenges by editing files in your IDE.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}): React.JSX.Element {
  // Strip non-serializable fields (loaders, readme) before passing to the Client Component Sidebar.
  const grouped = getGroupedChallenges();
  const sidebarData: Record<string, { slug: string; title: string; category: string; difficulty: string }[]> = {};
  for (const [category, items] of grouped) {
    sidebarData[category] = items.map(({ slug, title, category: cat, difficulty }) => ({
      slug,
      title,
      category: cat,
      difficulty,
    }));
  }

  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-background font-sans antialiased">
        <MswProvider>
          <div className="flex min-h-screen">
            <Sidebar grouped={sidebarData} />
            <div className="min-w-0 flex-1">{children}</div>
          </div>
        </MswProvider>
      </body>
    </html>
  );
}

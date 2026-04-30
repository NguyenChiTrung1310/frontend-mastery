import type { Metadata } from 'next';
import './globals.css';

import { Sidebar } from '@/components/layout/sidebar';
import { MswProvider } from '@/mocks/msw-provider';
import { ThemeProvider } from '@/components/theme-provider';
import { CommandPaletteProvider } from '@/components/command/command-palette-provider';
import { CHALLENGES } from '@/registry/challenges';
import type { ChallengeListItem } from '@/lib/challenge-list-item';

export const metadata: Metadata = {
  title: 'Frontend Mastery — Local Learning Platform',
  description:
    'Solve JS, TS, React, Next.js, and DSA challenges by editing files in your IDE.',
};

function getCommandItems(): ChallengeListItem[] {
  return CHALLENGES.map(
    ({ slug, title, category, difficulty, description, tags, estimatedMinutes }) => ({
      slug,
      title,
      category,
      difficulty,
      description,
      tags,
      estimatedMinutes,
    }),
  );
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}): React.JSX.Element {
  const commandItems = getCommandItems();

  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-background font-sans antialiased">
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          <MswProvider>
            <CommandPaletteProvider items={commandItems}>
              <div className="flex min-h-screen">
                <Sidebar />
                <div className="min-w-0 flex-1">{children}</div>
              </div>
            </CommandPaletteProvider>
          </MswProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

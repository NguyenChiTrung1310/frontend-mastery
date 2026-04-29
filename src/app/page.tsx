import Link from 'next/link';
import { ArrowRight, Sparkles, FileCode, GitCompare } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CHALLENGES } from '@/registry/challenges';

export default function HomePage(): React.JSX.Element {
  return (
    <div className="min-h-screen">
      <section className="mx-auto max-w-5xl px-8 py-16">
        <div className="mb-12">
          <Badge variant="outline" className="mb-4">
            <Sparkles className="mr-1 h-3 w-3" />
            Local-first
          </Badge>
          <h1 className="mb-3 text-4xl font-bold tracking-tight">
            Frontend Mastery
          </h1>
          <p className="max-w-2xl text-lg text-muted-foreground">
            An interactive platform for deepening your skills in JavaScript, TypeScript, React,
            Next.js, and DSA. Edit boilerplate files in your IDE, see them rendered live, and
            compare against expert solutions side-by-side.
          </p>
        </div>

        <div className="mb-12 grid gap-4 md:grid-cols-3">
          <FeatureCard
            icon={<FileCode className="h-5 w-5" />}
            title="Edit in your IDE"
            description="Solve challenges in your editor of choice. Hot reload reflects changes instantly."
          />
          <FeatureCard
            icon={<GitCompare className="h-5 w-5" />}
            title="Compare side-by-side"
            description="Toggle between your work and the expert solution to spot the differences."
          />
          <FeatureCard
            icon={<Sparkles className="h-5 w-5" />}
            title="Real-world depth"
            description="Each challenge ships with a README explaining the WHY — not just the WHAT."
          />
        </div>

        <h2 className="mb-4 text-xl font-semibold">Available challenges</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {CHALLENGES.map((c) => {
            const href = `/challenges/${c.category}/${c.difficulty}/${c.slug}`;
            return (
              <Card key={c.slug} className="transition-shadow hover:shadow-md">
                <CardHeader>
                  <div className="mb-2 flex items-center gap-2">
                    <Badge variant="outline" className="capitalize">
                      {c.category}
                    </Badge>
                    <Badge
                      variant={c.difficulty === 'advanced' ? 'destructive' : 'secondary'}
                      className="capitalize"
                    >
                      {c.difficulty}
                    </Badge>
                  </div>
                  <CardTitle>{c.title}</CardTitle>
                  <CardDescription>{c.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button asChild variant="ghost" size="sm">
                    <Link href={href}>
                      Open challenge
                      <ArrowRight className="ml-1 h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>
    </div>
  );
}

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

function FeatureCard({ icon, title, description }: FeatureCardProps): React.JSX.Element {
  return (
    <Card>
      <CardHeader>
        <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-md bg-primary text-primary-foreground">
          {icon}
        </div>
        <CardTitle className="text-base">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
    </Card>
  );
}

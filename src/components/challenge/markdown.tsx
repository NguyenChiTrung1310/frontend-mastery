'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { cn } from '@/lib/utils';

interface MarkdownProps {
  content: string;
  className?: string;
}

/**
 * Renders challenge READMEs with GFM + syntax-highlighted code blocks.
 * Kept as a client component because react-syntax-highlighter pulls in browser-side bundles.
 */
export function Markdown({ content, className }: MarkdownProps): React.JSX.Element {
  return (
    <div
      className={cn(
        'prose prose-slate max-w-none dark:prose-invert',
        'prose-headings:scroll-mt-20 prose-headings:font-semibold',
        'prose-h1:text-2xl prose-h2:text-xl prose-h3:text-lg',
        'prose-p:leading-7 prose-li:leading-7',
        'prose-code:rounded prose-code:bg-muted prose-code:px-1 prose-code:py-0.5',
        'prose-code:text-sm prose-code:before:content-none prose-code:after:content-none',
        'prose-pre:bg-zinc-950 prose-pre:p-0',
        className,
      )}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          code({ className, children, ...props }) {
            const match = /language-(\w+)/.exec(className ?? '');
            const isBlock = Boolean(match);
            if (!isBlock) {
              return (
                <code className={className} {...props}>
                  {children}
                </code>
              );
            }
            return (
              <SyntaxHighlighter
                language={match?.[1] ?? 'text'}
                style={oneDark}
                customStyle={{ margin: 0, borderRadius: '0.5rem', fontSize: '0.875rem' }}
                PreTag="div"
              >
                {String(children).replace(/\n$/, '')}
              </SyntaxHighlighter>
            );
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}

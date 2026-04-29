'use client';

import * as React from 'react';
import { AlertTriangle } from 'lucide-react';

interface ErrorBoundaryProps {
  children: React.ReactNode;
  label: string;
}

interface ErrorBoundaryState {
  error: Error | null;
}

/**
 * Class component because React error boundaries still require it. Catches render errors
 * thrown by user-edited boilerplate so the rest of the app stays interactive.
 */
export class PreviewErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  override state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  override componentDidCatch(error: Error, info: React.ErrorInfo): void {
    // eslint-disable-next-line no-console
    console.error(`[${this.props.label}] render error`, error, info.componentStack);
  }

  override render(): React.ReactNode {
    if (this.state.error) {
      return (
        <div className="flex h-full flex-col items-center justify-center gap-3 p-6 text-center">
          <AlertTriangle className="h-8 w-8 text-destructive" />
          <h3 className="font-semibold">{this.props.label} crashed</h3>
          <pre className="max-w-full overflow-auto rounded-md bg-muted p-3 text-left text-xs text-destructive">
            {this.state.error.message}
          </pre>
          <p className="text-xs text-muted-foreground">
            Fix the file and save — the page will hot reload.
          </p>
        </div>
      );
    }
    return this.props.children;
  }
}

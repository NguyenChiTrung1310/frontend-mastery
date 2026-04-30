'use client';

import { useEffect, useRef, useState } from 'react';
import { Search } from 'lucide-react';

import { Input } from '@/components/ui/input';

interface SearchBarProps {
  value: string;
  onChange: (next: string) => void;
  debounceMs?: number;
}

export function SearchBar({
  value,
  onChange,
  debounceMs = 150,
}: SearchBarProps): React.JSX.Element {
  const [local, setLocal] = useState(value);
  const lastFlushed = useRef(value);

  useEffect(() => {
    if (value !== lastFlushed.current) {
      setLocal(value);
      lastFlushed.current = value;
    }
  }, [value]);

  useEffect(() => {
    if (local === lastFlushed.current) return;
    const id = window.setTimeout(() => {
      lastFlushed.current = local;
      onChange(local);
    }, debounceMs);
    return () => window.clearTimeout(id);
  }, [local, debounceMs, onChange]);

  return (
    <div className="relative">
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        type="search"
        placeholder="Search title, tag, or description…"
        value={local}
        onChange={(e) => setLocal(e.target.value)}
        className="h-10 pl-9"
        aria-label="Search challenges"
      />
    </div>
  );
}

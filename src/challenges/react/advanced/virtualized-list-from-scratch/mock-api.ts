// Pure virtualization challenge — deterministic fake data, no network needed.

export interface Item {
  id: number;
  title: string;
  subtitle: string;
  category: string;
}

const CATEGORIES = ['Design', 'Engineering', 'Marketing', 'Product', 'Data', 'DevOps'];

/** Produces a stable, index-determined dataset — same output on every call. */
export function generateItems(count: number): Item[] {
  const items: Item[] = [];
  for (let i = 0; i < count; i++) {
    const cat = CATEGORIES[i % CATEGORIES.length] ?? 'General';
    items.push({
      id: i,
      title: `Item #${i + 1} — ${cat} record`,
      subtitle: `Created at index ${i} · category ${cat}`,
      category: cat,
    });
  }
  return items;
}

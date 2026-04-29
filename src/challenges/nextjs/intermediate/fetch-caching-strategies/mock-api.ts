export interface SiteConfig {
  siteName: string;
  version: string;
  fetchedAt: string;
  fromCache: boolean;
}

export interface TopProducts {
  products: Array<{ id: number; name: string; sales: number }>;
  fetchedAt: string;
  fromCache: boolean;
}

export interface LiveInventory {
  items: Array<{ sku: string; stock: number }>;
  fetchedAt: string;
  fromCache: boolean;
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Simulated cache: tracks whether data was generated this session.
const cache = {
  config: null as SiteConfig | null,
  products: null as TopProducts | null,
  productsTag: 0, // incremented by revalidateProducts()
};

export async function fetchSiteConfig(): Promise<SiteConfig> {
  await delay(200);
  if (cache.config) {
    return { ...cache.config, fromCache: true };
  }
  const data: SiteConfig = {
    siteName: 'Frontend Mastery',
    version: '2.4.1',
    fetchedAt: new Date().toLocaleTimeString(),
    fromCache: false,
  };
  cache.config = data;
  return data;
}

export async function fetchTopProducts(tag: number = cache.productsTag): Promise<TopProducts> {
  await delay(300);
  if (cache.products && tag === cache.productsTag) {
    return { ...cache.products, fromCache: true };
  }
  const data: TopProducts = {
    products: [
      { id: 1, name: 'TypeScript Handbook', sales: 1200 + Math.floor(Math.random() * 50) },
      { id: 2, name: 'React Deep Dive', sales: 980 + Math.floor(Math.random() * 50) },
      { id: 3, name: 'Next.js in Action', sales: 756 + Math.floor(Math.random() * 50) },
    ],
    fetchedAt: new Date().toLocaleTimeString(),
    fromCache: false,
  };
  cache.products = data;
  return data;
}

/** Simulates `revalidateTag('products')` — clears the products cache. */
export function revalidateProducts(): void {
  cache.products = null;
  cache.productsTag++;
}

export async function fetchLiveInventory(): Promise<LiveInventory> {
  await delay(150);
  // Never cached — always fresh
  return {
    items: [
      { sku: 'SKU-001', stock: Math.floor(Math.random() * 500) },
      { sku: 'SKU-002', stock: Math.floor(Math.random() * 500) },
      { sku: 'SKU-003', stock: Math.floor(Math.random() * 500) },
    ],
    fetchedAt: new Date().toLocaleTimeString(),
    fromCache: false,
  };
}

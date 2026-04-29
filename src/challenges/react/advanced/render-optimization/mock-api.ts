export interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
}

const CATEGORIES = ['Electronics', 'Books', 'Clothing', 'Home', 'Sports', 'Toys'] as const;
const ADJECTIVES = ['Premium', 'Eco', 'Smart', 'Classic', 'Modern', 'Compact', 'Wireless'];
const NOUNS = ['Headphones', 'Lamp', 'Chair', 'Book', 'Bag', 'Watch', 'Mug', 'Bottle', 'Speaker'];

/**
 * Deterministic LCG PRNG so the dataset is the same across reloads — important for
 * fair comparisons between boilerplate and solution.
 */
function makeRng(seed: number): () => number {
  let state = seed;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 0xffffffff;
  };
}

export function generateProducts(count = 10_000, seed = 42): Product[] {
  const rng = makeRng(seed);
  const products: Product[] = new Array(count);

  for (let i = 0; i < count; i++) {
    const adj = ADJECTIVES[Math.floor(rng() * ADJECTIVES.length)] ?? 'Item';
    const noun = NOUNS[Math.floor(rng() * NOUNS.length)] ?? 'Object';
    const category = CATEGORIES[Math.floor(rng() * CATEGORIES.length)] ?? 'Misc';
    products[i] = {
      id: i,
      name: `${adj} ${noun} #${i}`,
      category,
      price: Math.round(rng() * 50000) / 100,
    };
  }
  return products;
}

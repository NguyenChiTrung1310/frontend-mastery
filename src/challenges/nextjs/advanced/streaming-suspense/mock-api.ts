function delay<T>(value: T, ms: number): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

export interface UserProfile {
  name: string;
  email: string;
}
export interface Order {
  id: string;
  total: number;
}
export interface Product {
  id: string;
  name: string;
}

export const fetchProfile = (): Promise<UserProfile> =>
  delay({ name: 'Ava Chen', email: 'ava@example.com' }, 50);

export const fetchOrders = (): Promise<Order[]> =>
  delay(
    [
      { id: 'ORD-001', total: 89.99 },
      { id: 'ORD-002', total: 142.5 },
      { id: 'ORD-003', total: 26.0 },
    ],
    500,
  );

export const fetchRecommendations = (): Promise<Product[]> =>
  delay(
    [
      { id: 'P-9001', name: 'Wireless Headphones' },
      { id: 'P-9002', name: 'Standing Desk Mat' },
      { id: 'P-9003', name: 'Mechanical Keyboard' },
    ],
    2000,
  );

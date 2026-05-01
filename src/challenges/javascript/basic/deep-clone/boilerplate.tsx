'use client';

// ❌ Shallow clone — nested objects still share references
function deepClone<T>(value: T): T {
  if (typeof value !== 'object' || value === null) return value;
  // This only copies top-level properties — nested objects are still shared
  return { ...value };
}

const original = {
  name: 'Alice',
  scores: [10, 20, 30],
  address: { city: 'Hanoi', zip: '100000' },
  createdAt: new Date('2024-01-01'),
};

export default function DeepCloneBoilerplate(): React.JSX.Element {
  const clone = deepClone(original);
  // Mutate the clone — does it affect the original?
  clone.scores.push(99);
  clone.address.city = 'HCMC';

  return (
    <div className="space-y-3">
      <h2 className="text-base font-semibold">Deep Clone</h2>
      <p className="text-sm text-muted-foreground">After cloning and mutating the clone:</p>
      <div className="text-sm font-mono space-y-1">
        <p>original.scores: [{original.scores.join(', ')}] <span className="text-red-500">(should be [10,20,30])</span></p>
        <p>original.address.city: {original.address.city} <span className="text-red-500">(should be &quot;Hanoi&quot;)</span></p>
      </div>
    </div>
  );
}

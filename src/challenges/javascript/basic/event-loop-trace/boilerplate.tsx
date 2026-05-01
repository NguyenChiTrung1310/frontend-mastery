'use client';
import { useState } from 'react';

const SNIPPETS = [
  {
    code: `console.log('A');
setTimeout(() => console.log('B'), 0);
Promise.resolve().then(() => console.log('C'));
console.log('D');`,
    options: ['A D B C', 'A D C B', 'A B C D', 'A C D B'],
    correct: 1,
  },
  {
    code: `Promise.resolve()
  .then(() => console.log('1'))
  .then(() => console.log('2'));
Promise.resolve().then(() => console.log('3'));`,
    options: ['1 2 3', '1 3 2', '3 1 2', '2 3 1'],
    correct: 1,
  },
  {
    code: `setTimeout(() => console.log('X'), 0);
setTimeout(() => console.log('Y'), 0);
Promise.resolve().then(() => {
  console.log('Z');
  Promise.resolve().then(() => console.log('W'));
});`,
    options: ['Z W X Y', 'X Y Z W', 'Z X W Y', 'X Z W Y'],
    correct: 0,
  },
];

export default function EventLoopTraceBoilerplate(): React.JSX.Element {
  const [selected, setSelected] = useState([0, 0, 2]); // pre-selected wrong answers
  const [checked, setChecked] = useState(false);

  return (
    <div className="space-y-6">
      <h2 className="text-base font-semibold">Event Loop Trace</h2>
      {SNIPPETS.map((s, si) => (
        <div key={si} className="space-y-2">
          <pre className="rounded bg-muted p-3 text-xs">{s.code}</pre>
          <div className="space-y-1">
            {s.options.map((opt, oi) => (
              <label key={oi} className="flex items-center gap-2 text-sm cursor-pointer">
                <input type="radio" name={`q${si}`} checked={selected[si] === oi}
                  onChange={() => setSelected(prev => { const n=[...prev]; n[si]=oi; return n; })} />
                {opt}
                {checked && oi === s.correct && <span className="text-green-600 text-xs">✓ correct</span>}
                {checked && selected[si] === oi && oi !== s.correct && <span className="text-red-500 text-xs">✗ wrong</span>}
              </label>
            ))}
          </div>
        </div>
      ))}
      <button onClick={() => setChecked(true)} className="rounded-md bg-primary px-3 py-1.5 text-sm text-primary-foreground">
        Check answers
      </button>
    </div>
  );
}

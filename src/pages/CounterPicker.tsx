import React from 'react';

const CounterPicker: React.FC = () => {
  return (
    <div className="bg-slate-900 text-white min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-4">Counter Picker</h1>
        <p className="text-lg text-slate-400">
          Select heroes to find their best counters and synergies.
        </p>
        <div className="mt-8 p-6 bg-slate-800/50 rounded-lg border border-slate-700">
          <h2 className="text-2xl font-semibold mb-3">Feature Under Construction</h2>
          <p>
            We are building an advanced tool to help you dominate your games by picking the right heroes. Stay tuned for updates!
          </p>
        </div>
      </div>
    </div>
  );
};

export default CounterPicker; 
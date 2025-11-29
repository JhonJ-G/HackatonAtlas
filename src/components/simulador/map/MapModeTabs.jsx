import React from 'react';

const MODES = [
  { key: 'solar', label: 'Solar' },
  { key: 'eolico', label: 'Eólico' },
  { key: 'hibrido', label: 'Híbrido' },
];

export default function MapModeTabs({ selectedEnergyType, onChange, className = '' }) {
  return (
    <div className={`inline-flex rounded-lg overflow-hidden border border-white/10 bg-white/5 ${className}`} role="tablist" aria-label="Tipo de energía">
      {MODES.map((m) => {
        const active = selectedEnergyType === m.key;
        return (
          <button
            key={m.key}
            role="tab"
            aria-selected={active}
            onClick={() => onChange?.(m.key)}
            className={
              `px-4 py-2 text-sm transition-colors ${
                active
                  ? 'bg-accent-green text-white'
                  : 'text-white/80 hover:bg-white/10'
              }`
            }
          >
            {m.label}
          </button>
        );
      })}
    </div>
  );
}

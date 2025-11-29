import React from 'react';

const MODES = [
  { key: 'solar', label: 'Solar' },
  { key: 'eolico', label: 'Eólico' },
  { key: 'hibrido', label: 'Híbrido' },
];

export default function MapModeTabs({ selectedEnergyType, onChange, className = '' }) {
  return (
    <div className={`inline-flex rounded-lg overflow-hidden border border-white/20 bg-slate-900/30 backdrop-blur-sm ${className}`} role="tablist" aria-label="Tipo de energía">
      {MODES.map((m) => {
        const active = selectedEnergyType === m.key;
        return (
          <button
            key={m.key}
            role="tab"
            aria-selected={active}
            onClick={() => onChange?.(m.key)}
            className={
              `px-3 py-2 text-sm font-medium transition-colors ${
                active
                  ? 'bg-accent-green text-white shadow-sm'
                  : 'text-slate-200 hover:text-white hover:bg-slate-800/50'
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

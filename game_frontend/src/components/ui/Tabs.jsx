import React, { useState } from 'react';
import './tabs.css';

// PUBLIC_INTERFACE
export function Tabs({ tabs = [], defaultIndex = 0 }) {
  /** Simple tabs control. tabs: [{label, content}] */
  const [idx, setIdx] = useState(defaultIndex);
  const active = tabs[idx] || {};
  return (
    <div className="tabs">
      <div className="tab-list">
        {tabs.map((t, i) => (
          <button
            key={i}
            className={`tab ${i === idx ? 'active' : ''}`}
            onClick={() => setIdx(i)}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div className="tab-panel surface">
        {active.content}
      </div>
    </div>
  );
}

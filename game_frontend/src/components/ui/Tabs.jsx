import React, { useCallback, useEffect, useRef, useState } from 'react';
import './tabs.css';

// PUBLIC_INTERFACE
export function Tabs({ tabs = [], defaultIndex = 0 }) {
  /** Simple tabs control. tabs: [{label, content}] with ARIA roles and keyboard navigation. */
  const [idx, setIdx] = useState(defaultIndex);
  const listRef = useRef(null);
  const active = tabs[idx] || {};

  const onKeyDown = useCallback((e) => {
    if (!tabs.length) return;
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      setIdx((i) => (i + 1) % tabs.length);
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      setIdx((i) => (i - 1 + tabs.length) % tabs.length);
    } else if (e.key === 'Home') {
      e.preventDefault();
      setIdx(0);
    } else if (e.key === 'End') {
      e.preventDefault();
      setIdx(tabs.length - 1);
    }
  }, [tabs.length]);

  useEffect(() => {
    const el = listRef.current?.querySelector('[aria-selected="true"]');
    try { el?.focus(); } catch {}
  }, [idx]);

  return (
    <div className="tabs">
      <div
        className="tab-list"
        role="tablist"
        aria-label="Tabs"
        onKeyDown={onKeyDown}
        ref={listRef}
      >
        {tabs.map((t, i) => (
          <button
            key={i}
            role="tab"
            aria-selected={i === idx}
            aria-controls={`panel-${i}`}
            id={`tab-${i}`}
            tabIndex={i === idx ? 0 : -1}
            className={`tab ${i === idx ? 'active' : ''}`}
            onClick={() => setIdx(i)}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div
        className="tab-panel surface"
        role="tabpanel"
        id={`panel-${idx}`}
        aria-labelledby={`tab-${idx}`}
        tabIndex={0}
      >
        {active.content}
      </div>
    </div>
  );
}

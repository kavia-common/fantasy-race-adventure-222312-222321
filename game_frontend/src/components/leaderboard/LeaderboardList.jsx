import React from 'react';
import { Button } from '../ui/Button';

/**
 * PUBLIC_INTERFACE
 * A reusable leaderboard list with loading/empty/error states.
 * - items: Array<{ id|string, name:string, score:number }>
 * - status: 'idle'|'loading'|'loaded'|'error'
 * - compact: boolean to render a condensed variant (ideal for sidebar)
 * - max: number optional trim count
 * - onRefresh: optional handler to refetch
 */
export function LeaderboardList({
  items = [],
  status = 'idle',
  compact = false,
  max,
  onRefresh,
  title = 'Top Scores',
  ariaLabel = 'Leaderboard list',
}) {
  const data = Array.isArray(items) ? items : [];
  const trimmed = typeof max === 'number' ? data.slice(0, max) : data;
  const isLoading = status === 'loading';
  const isError = status === 'error';
  const isEmpty = !isLoading && !isError && trimmed.length === 0;

  const rowPadding = compact ? '8px 10px' : '10px 12px';
  const fontSize = compact ? 13 : 14;

  return (
    <div className="col" style={{ gap: 8 }} aria-label={ariaLabel}>
      <div className="row" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
        <strong style={{ fontSize: compact ? 14 : 16 }}>{title}</strong>
        {onRefresh && (
          <Button variant="ghost" size="sm" onClick={onRefresh} aria-label="Refresh leaderboard">
            Refresh
          </Button>
        )}
      </div>

      {isLoading && (
        <div className="muted" role="status" aria-live="polite">
          Loading top scores...
        </div>
      )}

      {isError && (
        <div role="alert" style={{ color: 'var(--color-error)', fontSize }}>
          Failed to load leaderboard. Showing cached or mock data.
        </div>
      )}

      {isEmpty && (
        <div className="muted" style={{ fontSize }}>
          No scores yet. Be the first to set a record!
        </div>
      )}

      {trimmed.map((p, idx) => (
        <div
          key={p.id || `${p.name}-${idx}`}
          className="surface"
          style={{
            padding: rowPadding,
            borderRadius: 10,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
          aria-label={`Rank ${idx + 1}, ${p.name}, ${p.score} points`}
        >
          <div className="row" style={{ alignItems: 'center' }}>
            <div
              aria-hidden="true"
              style={{
                width: 26,
                height: 26,
                borderRadius: 8,
                background:
                  idx === 0
                    ? 'linear-gradient(180deg, rgba(245,158,11,0.95), rgba(245,158,11,0.75))'
                    : idx === 1
                    ? 'linear-gradient(180deg, rgba(37,99,235,0.95), rgba(37,99,235,0.75))'
                    : 'linear-gradient(180deg, rgba(17,24,39,0.15), rgba(17,24,39,0.08))',
                color: '#111827',
                display: 'grid',
                placeItems: 'center',
                boxShadow: 'var(--shadow-sm)',
                marginRight: 10,
                fontWeight: 800,
                fontSize: compact ? 12 : 13,
              }}
              title={`#${idx + 1}`}
            >
              #{idx + 1}
            </div>
            <div>
              <div style={{ fontWeight: 600, fontSize }}>{p.name}</div>
              {!compact && (
                <div className="muted" style={{ fontSize: 12 }}>
                  Player
                </div>
              )}
            </div>
          </div>
          <div className="row" style={{ alignItems: 'baseline', gap: 6 }}>
            <strong style={{ fontSize }}>{p.score}</strong>
            <span className="muted" style={{ fontSize: 12 }}>
              pts
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

export default LeaderboardList;

import React from 'react';
import { Card } from '../components/ui/Card';

// PUBLIC_INTERFACE
export function Leaderboard() {
  /** Leaderboard screen placeholder showing top players. */
  const mockLeaders = [
    { id: 1, name: 'Nova', score: 12450 },
    { id: 2, name: 'Kai', score: 11210 },
    { id: 3, name: 'Mika', score: 9750 },
  ];

  return (
    <Card title="Leaderboard">
      <div className="col" style={{ gap: 8 }}>
        {mockLeaders.map((p, i) => (
          <div key={p.id} className="surface" style={{ padding: 10, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div><strong>#{i + 1}</strong> {p.name}</div>
            <div className="muted">{p.score} pts</div>
          </div>
        ))}
      </div>
    </Card>
  );
}

export default Leaderboard;

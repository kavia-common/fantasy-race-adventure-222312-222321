import React, { useState } from 'react';
import { Button } from '../ui/Button';

// PUBLIC_INTERFACE
export function RoomCreateJoin({ onCreate, onJoin }) {
  /** Simple create and join forms side by side. */
  const [name, setName] = useState('');
  const [maxPlayers, setMaxPlayers] = useState(8);
  const [joinId, setJoinId] = useState('');

  return (
    <div className="row" style={{ gap: 16, flexWrap: 'wrap' }}>
      <div className="surface" style={{ padding: 12, borderRadius: 12, display: 'grid', gap: 10, minWidth: 260 }}>
        <strong>Create Room</strong>
        <label style={{ fontSize: 13 }} className="muted">Name</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="My Room"
          style={{ padding: 8, borderRadius: 8, border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text)' }}
        />
        <label style={{ fontSize: 13 }} className="muted">Max Players</label>
        <input
          type="number"
          min={2}
          max={16}
          value={maxPlayers}
          onChange={(e) => setMaxPlayers(Number(e.target.value || 8))}
          style={{ padding: 8, borderRadius: 8, border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text)' }}
        />
        <Button
          onClick={() => onCreate?.({ name: name || `Room ${Math.floor(Math.random() * 999)}`, maxPlayers })}
          disabled={!name.trim()}
        >
          Create
        </Button>
      </div>

      <div className="surface" style={{ padding: 12, borderRadius: 12, display: 'grid', gap: 10, minWidth: 260 }}>
        <strong>Join by ID</strong>
        <label style={{ fontSize: 13 }} className="muted">Room ID</label>
        <input
          value={joinId}
          onChange={(e) => setJoinId(e.target.value)}
          placeholder="room-abc123"
          style={{ padding: 8, borderRadius: 8, border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text)' }}
        />
        <Button onClick={() => onJoin?.(joinId)} disabled={!joinId.trim()}>Join</Button>
      </div>
    </div>
  );
}

export default RoomCreateJoin;

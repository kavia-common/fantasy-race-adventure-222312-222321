import React from 'react';
import { Button } from '../ui/Button';

// PUBLIC_INTERFACE
export function RoomList({ rooms = [], selectedId, onSelect, onJoin }) {
  /** Display a list of rooms with select and join actions. */
  if (!rooms.length) {
    return <div className="muted">No rooms yet. Create one to get started!</div>;
  }
  return (
    <div className="col" style={{ gap: 10 }}>
      {rooms.map((room) => (
        <div
          key={room.id}
          className="surface"
          style={{ padding: 12, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
        >
          <div>
            <div style={{ fontWeight: 600 }}>{room.name}</div>
            <div className="muted" style={{ fontSize: 13 }}>
              {room.players}/{room.maxPlayers} • {room.status}
            </div>
          </div>
          <div className="row">
            <Button
              variant="ghost"
              aria-pressed={selectedId === room.id}
              onClick={() => onSelect?.(room.id)}
            >
              {selectedId === room.id ? 'Selected' : 'Select'}
            </Button>
            <Button onClick={() => onJoin?.(room.id)}>Join</Button>
          </div>
        </div>
      ))}
    </div>
  );
}

export default RoomList;

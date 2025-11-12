import React from 'react';
import { Button } from '../ui/Button';

// PUBLIC_INTERFACE
export function RoomList({ rooms = [], selectedId, onSelect, onJoin }) {
  /** Display a list of rooms with select and join actions. */
  if (!rooms.length) {
    return <div className="muted">No rooms yet. Create one to get started!</div>;
  }
  return (
    <ul className="col" style={{ gap: 10, listStyle: 'none', padding: 0, margin: 0 }} role="list" aria-label="Available rooms">
      {rooms.map((room) => (
        <li
          key={room.id}
          className="surface"
          style={{ padding: 12, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
          role="listitem"
          aria-label={`${room.name}, ${room.players}/${room.maxPlayers}, ${room.status}`}
        >
          <div>
            <div style={{ fontWeight: 600 }}>{room.name}</div>
            <div className="muted" style={{ fontSize: 13 }}>
              {room.players}/{room.maxPlayers} • {room.status}
            </div>
          </div>
          <div className="row" role="group" aria-label={`${room.name} actions`}>
            <Button
              variant="ghost"
              aria-pressed={selectedId === room.id}
              ariaLabel={selectedId === room.id ? 'Room selected' : 'Select room'}
              onClick={() => onSelect?.(room.id)}
            >
              {selectedId === room.id ? 'Selected' : 'Select'}
            </Button>
            <Button ariaLabel={`Join ${room.name}`} onClick={() => onJoin?.(room.id)}>Join</Button>
          </div>
        </li>
      ))}
    </ul>
  );
}

export default RoomList;

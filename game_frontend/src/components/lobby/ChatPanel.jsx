import React, { useEffect, useRef, useState } from 'react';
import { Button } from '../ui/Button';

// PUBLIC_INTERFACE
export function ChatPanel({ messages = [], onSend }) {
  /** Basic chat panel with scroll and input. */
  const [text, setText] = useState('');
  const scrollerRef = useRef(null);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [messages]);

  function submit(e) {
    e.preventDefault();
    const msg = text.trim();
    if (!msg) return;
    onSend?.(msg);
    setText('');
  }

  return (
    <div className="surface" style={{ borderRadius: 12, padding: 12, display: 'grid', gap: 10 }}>
      <strong id="lobby-chat-label">Lobby Chat</strong>
      <div
        ref={scrollerRef}
        className="surface"
        style={{ padding: 8, borderRadius: 8, maxHeight: 180, overflowY: 'auto' }}
        aria-live="polite"
        aria-labelledby="lobby-chat-label"
        role="log"
      >
        {messages.length === 0 && <div className="muted" style={{ fontSize: 13 }}>No messages yet.</div>}
        {messages.map((m) => (
          <div key={m.id} style={{ padding: '6px 4px' }}>
            <span style={{ fontWeight: 600 }}>{m.user || 'Guest'}: </span>
            <span>{m.text}</span>
            <span className="muted" style={{ marginLeft: 8, fontSize: 11 }}>{new Date(m.ts || Date.now()).toLocaleTimeString()}</span>
          </div>
        ))}
      </div>
      <form onSubmit={submit} className="row" style={{ gap: 8 }} aria-label="Send chat message">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type a message"
          aria-label="Chat message"
          style={{ flex: 1, padding: 8, borderRadius: 8, border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text)' }}
        />
        <Button type="submit" ariaLabel="Send message">Send</Button>
      </form>
    </div>
  );
}

export default ChatPanel;

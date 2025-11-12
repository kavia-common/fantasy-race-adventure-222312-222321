import React from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';

// PUBLIC_INTERFACE
export function NotFound() {
  /** 404 screen for unknown routes. */
  return (
    <Card title="Not Found">
      <p className="muted">The page you are looking for does not exist.</p>
      <div style={{ marginTop: 12 }}>
        <a href="#/"><Button>Go Home</Button></a>
      </div>
    </Card>
  );
}

export default NotFound;

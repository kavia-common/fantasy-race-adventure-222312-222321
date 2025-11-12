import React, { useEffect, useState } from 'react';
import { getEnv } from '../../config/env';
import { httpGet } from '../../api/http';
import { logger } from '../../utils/logger';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';

// PUBLIC_INTERFACE
export function HealthCheck({ inline = false }) {
  /**
   * HealthCheck component that pings backend's REACT_APP_HEALTHCHECK_PATH.
   * Shows status and allows manual refresh.
   */
  const { healthcheckPath } = getEnv();
  const [status, setStatus] = useState({ ok: null, code: null, ts: null });

  async function ping() {
    try {
      const res = await httpGet(healthcheckPath);
      setStatus({ ok: res.ok, code: res.status, ts: Date.now() });
    } catch (e) {
      logger.warn('[health] ping error', e);
      setStatus({ ok: false, code: 0, ts: Date.now() });
    }
  }

  useEffect(() => {
    ping();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const content = (
    <div className="row" style={{ alignItems: 'center', justifyContent: 'space-between' }}>
      <div>
        <div style={{ fontWeight: 600 }}>Service Health</div>
        <div className="muted" style={{ fontSize: 13 }}>
          {status.ok === null ? 'Checking...' : status.ok ? `Healthy (HTTP ${status.code})` : `Unhealthy (HTTP ${status.code})`}
        </div>
      </div>
      <Button variant="ghost" onClick={ping}>Refresh</Button>
    </div>
  );

  if (inline) return content;
  return <Card title="Health">{content}</Card>;
}

export default HealthCheck;

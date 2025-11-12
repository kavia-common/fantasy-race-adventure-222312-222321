import React, { useEffect, useMemo } from 'react';
import { Card } from '../components/ui/Card';
import LeaderboardList from '../components/leaderboard/LeaderboardList';
import { useActions, useSelector, selectors } from '../state/store';
import { leaderboardApi } from '../api/endpoints';
import { Button } from '../components/ui/Button';

// PUBLIC_INTERFACE
export function Leaderboard() {
  /**
   * Leaderboard screen: displays full top scores with loading/error states.
   * Uses cached state where possible and provides manual refresh.
   */
  const items = useSelector(selectors.leaderboardItems);
  const status = useSelector(selectors.leaderboardStatus);
  const { setLeaderboard, setLeaderboardStatus } = useActions();

  async function refresh() {
    try {
      setLeaderboardStatus('loading');
      const data = await leaderboardApi.getTopScores({ limit: 50 });
      setLeaderboard(data);
      setLeaderboardStatus('loaded');
    } catch {
      setLeaderboardStatus('error');
    }
  }

  useEffect(() => {
    if (status === 'idle' || (status === 'loaded' && (!items || items.length === 0))) {
      refresh();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  const subtitle = useMemo(() => {
    if (status === 'loading') return 'Fetching latest records...';
    if (status === 'error') return 'Showing cached/mock data due to a connection issue.';
    return `Players: ${items.length}`;
  }, [status, items.length]);

  return (
    <Card
      title="Leaderboard"
      footer={
        <div className="row" style={{ justifyContent: 'space-between', width: '100%' }}>
          <span className="muted" style={{ fontSize: 13 }}>{subtitle}</span>
          <div className="row">
            <a href="#/"><Button variant="ghost">Home</Button></a>
            <Button variant="ghost" onClick={refresh} aria-label="Refresh leaderboard">Refresh</Button>
          </div>
        </div>
      }
    >
      <LeaderboardList
        items={items}
        status={status}
        compact={false}
        ariaLabel="Top players leaderboard"
        onRefresh={refresh}
      />
    </Card>
  );
}

export default Leaderboard;

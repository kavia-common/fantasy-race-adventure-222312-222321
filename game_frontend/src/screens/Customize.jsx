import React, { useEffect } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Tabs } from '../components/ui/Tabs';
import { useActions, useSelector, selectors } from '../state/store';
import { cosmeticsApi } from '../api/endpoints';
import { logger } from '../utils/logger';

// PUBLIC_INTERFACE
export function Customize() {
  /** Character customization screen with outfits and accessories listing. */
  const cosmetics = useSelector(selectors.cosmetics);
  const owned = useSelector(selectors.owned);
  const equipped = useSelector(selectors.equipped);
  const { setCosmetics, purchaseCosmetic, equipCosmetic } = useActions();

  useEffect(() => {
    (async () => {
      try {
        const data = await cosmeticsApi.list();
        setCosmetics(data);
      } catch (e) {
        logger.warn('[customize] load failed', e);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function renderItems(items = []) {
    return (
      <div className="col" style={{ gap: 10 }}>
        {items.map((item) => {
          const isOwned = owned.has(item.id) || item.owned;
          const isEquipped = equipped.outfit === item.id || equipped.accessory === item.id;
          return (
            <div key={item.id} className="surface" style={{ padding: 10, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontWeight: 600 }}>{item.name}</div>
                <div className="muted" style={{ fontSize: 13 }}>{isOwned ? 'Owned' : `Price: ${item.price}`}</div>
              </div>
              <div className="row">
                {!isOwned && (
                  <Button
                    variant="secondary"
                    onClick={() => {
                      purchaseCosmetic(item.id);
                    }}
                  >
                    Purchase
                  </Button>
                )}
                <Button
                  onClick={() => {
                    if (!isOwned) return;
                    equipCosmetic(item.id);
                  }}
                  disabled={!isOwned}
                >
                  {isEquipped ? 'Equipped' : 'Equip'}
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  const tabs = [
    { label: 'Outfits', content: renderItems(cosmetics.outfits) },
    { label: 'Accessories', content: renderItems(cosmetics.accessories) },
  ];

  return (
    <Card title="Customize">
      <div className="row" style={{ justifyContent: 'space-between', marginBottom: 8 }}>
        <div className="muted">Switch up your look before you race.</div>
        <Button variant="ghost" onClick={() => (window.location.hash = '#/')}>Home</Button>
      </div>
      <Tabs tabs={tabs} />
    </Card>
  );
}

export default Customize;

import React from 'react';
import { Button } from '../ui/Button';
import { RARITY_COLORS } from '../../features/cosmetics/catalog';

// PUBLIC_INTERFACE
export function OutfitGrid({ items = [], owned = new Set(), equipped = {}, onPreview, onEquip, onBuy, canAfford }) {
  /** Grid listing of items with rarity and actions. */
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
      gap: 12,
    }}>
      {items.map((item) => {
        const isOwned = owned.has(item.id) || item.owned;
        const isEquipped = equipped.outfit === item.id || equipped.accessory === item.id;
        const color = RARITY_COLORS[item.rarity] || 'var(--muted)';
        return (
          <div key={item.id} className="surface" style={{ padding: 12, borderRadius: 12, display: 'grid', gap: 8 }}>
            <div className="row" style={{ justifyContent: 'space-between' }}>
              <strong>{item.name}</strong>
              <span style={{ color, fontSize: 12, fontWeight: 600, textTransform: 'uppercase' }}>
                {item.rarity}
              </span>
            </div>
            <div className="muted" style={{ fontSize: 13 }}>
              {isOwned ? 'Owned' : `Price: ${item.price}c`}
            </div>
            <div className="row" style={{ gap: 8 }}>
              <Button variant="ghost" onClick={() => onPreview?.(item)}>Preview</Button>
              {isOwned ? (
                <Button onClick={() => onEquip?.(item)} disabled={isEquipped}>
                  {isEquipped ? 'Equipped' : 'Equip'}
                </Button>
              ) : (
                <Button variant="secondary" onClick={() => onBuy?.(item)} disabled={!canAfford?.(item.price)}>
                  Buy
                </Button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default OutfitGrid;

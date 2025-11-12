import React from 'react';
import { RARITY_COLORS } from '../../features/cosmetics/catalog';

// PUBLIC_INTERFACE
export function CharacterPreview({ outfitColor = '#2563EB', accessoryLabel = 'Band', equipped = {}, coins = 0 }) {
  /** Visual preview of the character with selected outfit color and accessory label. */
  return (
    <div className="surface" style={{ padding: 12, borderRadius: 12 }}>
      <div className="row" style={{ justifyContent: 'space-between', marginBottom: 8 }}>
        <strong>Preview</strong>
        <div className="muted" style={{ fontSize: 13 }}>Coins: {coins}</div>
      </div>
      <div style={{ display: 'grid', placeItems: 'center', height: 220, position: 'relative' }}>
        {/* Avatar base */}
        <div style={{
          width: 120, height: 160, borderRadius: 16, background: outfitColor,
          boxShadow: 'var(--shadow-md)', position: 'relative'
        }}>
          {/* face mark */}
          <div style={{ position: 'absolute', top: 18, right: 16, width: 8, height: 16, background: '#fff', opacity: 0.9, borderRadius: 3 }} />
          {/* accessory tag */}
          <div style={{
            position: 'absolute', bottom: 10, left: '50%', transform: 'translateX(-50%)',
            padding: '4px 8px', borderRadius: 8, fontSize: 12,
            background: 'rgba(0,0,0,0.35)', color: '#fff'
          }}>
            {accessoryLabel}
          </div>
        </div>
        {/* Equip tags */}
        <div style={{ position: 'absolute', top: 6, left: 6, display: 'flex', gap: 8 }}>
          {equipped?.outfit && <span style={{ background: 'rgba(37,99,235,0.12)', color: RARITY_COLORS.legendary, padding: '3px 8px', borderRadius: 8, fontSize: 12 }}>Outfit</span>}
          {equipped?.accessory && <span style={{ background: 'rgba(245,158,11,0.12)', color: '#F59E0B', padding: '3px 8px', borderRadius: 8, fontSize: 12 }}>Accessory</span>}
        </div>
      </div>
    </div>
  );
}

export default CharacterPreview;

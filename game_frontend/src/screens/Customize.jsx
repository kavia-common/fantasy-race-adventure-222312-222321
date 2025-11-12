import React, { useEffect, useMemo, useState } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Tabs } from '../components/ui/Tabs';
import { useActions, useSelector, selectors } from '../state/store';
import { logger } from '../utils/logger';
import { CosmeticsService } from '../features/cosmetics/CosmeticsService';
import CharacterPreview from '../components/customize/CharacterPreview';
import OutfitGrid from '../components/customize/OutfitGrid';
import PurchaseDialog from '../components/customize/PurchaseDialog';
import { cosmeticsCatalog } from '../features/cosmetics/catalog';

// PUBLIC_INTERFACE
export function Customize() {
  /** Character customization screen with outfits and accessories, wallet spend, and preview. */
  const cosmetics = useSelector(selectors.cosmetics);
  const owned = useSelector(selectors.owned);
  const equipped = useSelector(selectors.equipped);
  const coins = useSelector(selectors.coins);
  const canAffordSel = useMemo(() => selectors.canAfford, []);
  const canAfford = useSelector(canAffordSel(0)) && ((price) => selectors.canAfford(price));

  const { setCosmetics, purchaseCosmetic, equipCosmetic, spendCoins, earnCoins, addToast } = useActions();

  const [preview, setPreview] = useState({ outfitColor: '#2563EB', accessory: 'Band' });
  const [pendingBuy, setPendingBuy] = useState(null);
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    (async () => {
      try {
        const data = await CosmeticsService.list();
        setCosmetics(data);
      } catch (e) {
        logger.warn('[customize] load failed', e);
        setCosmetics(cosmeticsCatalog);
      }
    })();
    // Give player a small starter bonus for demo
    earnCoins(300);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Derive preview from equipped or selected
  const previewColor = useMemo(() => {
    const outf = (cosmetics.outfits || []).find(o => o.id === (preview?.outfitId || equipped.outfit));
    return outf?.previewColor || '#2563EB';
  }, [cosmetics.outfits, equipped.outfit, preview.outfitId]);
  const accessoryLabel = useMemo(() => {
    const acc = (cosmetics.accessories || []).find(a => a.id === (preview?.accessoryId || equipped.accessory));
    return acc?.name || 'Accessory';
  }, [cosmetics.accessories, equipped.accessory, preview.accessoryId]);

  function openBuy(item) {
    setPendingBuy(item);
  }

  async function confirmBuy() {
    const item = pendingBuy;
    if (!item) return;
    const price = Number(item.price) || 0;
    if (coins < price) {
      addToast('Not enough coins', 2000);
      setPendingBuy(null);
      return;
    }
    // Optimistic spend
    spendCoins(price);
    purchaseCosmetic(item.id);
    addToast(`Purchased ${item.name}!`, 1800);
    setPendingBuy(null);
    try {
      const res = await CosmeticsService.purchase(item.id);
      if (!res?.success) {
        // rollback if failed
        addToast('Purchase failed. Refunding...', 2000);
        earnCoins(price);
      }
    } catch {
      // already handled by service as success
    }
  }

  async function onEquip(item) {
    if (!owned.has(item.id) && !item.owned) {
      return;
    }
    equipCosmetic(item.id);
    addToast(`Equipped ${item.name}`, 1500);
    try {
      await CosmeticsService.equip(item.id);
    } catch {}
  }

  const tabs = [
    {
      label: 'Outfits',
      content: (
        <OutfitGrid
          items={cosmetics.outfits}
          owned={owned}
          equipped={equipped}
          onPreview={(item) => setPreview((p) => ({ ...p, outfitId: item.id, outfitColor: item.previewColor || '#2563EB' }))}
          onEquip={onEquip}
          onBuy={openBuy}
          canAfford={(price) => (coins >= (Number(price) || 0))}
        />
      )
    },
    {
      label: 'Accessories',
      content: (
        <OutfitGrid
          items={cosmetics.accessories}
          owned={owned}
          equipped={equipped}
          onPreview={(item) => setPreview((p) => ({ ...p, accessoryId: item.id }))}
          onEquip={onEquip}
          onBuy={openBuy}
          canAfford={(price) => (coins >= (Number(price) || 0))}
        />
      )
    },
  ];

  return (
    <Card title="Customize">
      <div className="col" style={{ gap: 12 }}>
        <div className="row" style={{ justifyContent: 'space-between' }}>
          <div className="muted">Switch up your look before you race.</div>
          <div className="row">
            <Button variant="ghost" onClick={() => earnCoins(50)}>Earn +50</Button>
            <Button variant="ghost" onClick={() => (window.location.hash = '#/')}>Home</Button>
          </div>
        </div>

        <CharacterPreview
          outfitColor={previewColor}
          accessoryLabel={accessoryLabel}
          equipped={equipped}
          coins={coins}
        />

        <Tabs
          tabs={tabs}
          defaultIndex={activeTab}
        />

        <PurchaseDialog
          open={!!pendingBuy}
          item={pendingBuy}
          coins={coins}
          onConfirm={confirmBuy}
          onCancel={() => setPendingBuy(null)}
        />
      </div>
    </Card>
  );
}

export default Customize;

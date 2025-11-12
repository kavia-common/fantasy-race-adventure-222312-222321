import React from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';

// PUBLIC_INTERFACE
export function PurchaseDialog({ open, item, coins = 0, onConfirm, onCancel }) {
  /** Confirmation modal before purchasing an item with coins. */
  if (!open) return null;
  const price = Number(item?.price) || 0;
  const can = coins >= price;

  return (
    <Modal
      open={open}
      title="Confirm Purchase"
      onClose={onCancel}
      actions={
        <div className="row">
          <Button variant="ghost" onClick={onCancel}>Cancel</Button>
          <Button onClick={() => onConfirm?.()} disabled={!can}>Buy for {price}c</Button>
        </div>
      }
    >
      <div className="col" style={{ gap: 8 }}>
        <div>
          Purchase <strong>{item?.name}</strong> for <strong>{price} coins</strong>?
        </div>
        <div className="muted" style={{ fontSize: 13 }}>
          Balance: {coins} → {Math.max(0, coins - price)} coins
        </div>
        {!can && <div style={{ color: 'var(--color-error)', fontSize: 13 }}>Not enough coins.</div>}
      </div>
    </Modal>
  );
}

export default PurchaseDialog;

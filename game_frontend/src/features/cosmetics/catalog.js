//
// Cosmetics catalog: sample items, rarity, and color tokens
//

/**
 * Rarity scale with Ocean Professional themed colors.
 */
export const RARITY = {
  COMMON: 'common',
  RARE: 'rare',
  EPIC: 'epic',
  LEGENDARY: 'legendary',
};

export const RARITY_COLORS = {
  [RARITY.COMMON]: '#9CA3AF',     // gray-400
  [RARITY.RARE]: '#2563EB',       // blue-600
  [RARITY.EPIC]: '#7C3AED',       // violet-700
  [RARITY.LEGENDARY]: '#F59E0B',  // amber-500
};

/**
 * PUBLIC_INTERFACE
 * Base catalog of outfits and accessories with prices and rarity.
 */
export const cosmeticsCatalog = {
  outfits: [
    { id: 'outfit-basic', name: 'Basic', price: 0, rarity: RARITY.COMMON, owned: true, previewColor: '#2563EB' },
    { id: 'outfit-spark', name: 'Spark Runner', price: 120, rarity: RARITY.RARE, previewColor: '#1D4ED8' },
    { id: 'outfit-street', name: 'Street Glide', price: 220, rarity: RARITY.EPIC, previewColor: '#0EA5E9' },
    { id: 'outfit-aurora', name: 'Aurora Pulse', price: 380, rarity: RARITY.LEGENDARY, previewColor: '#F59E0B' },
  ],
  accessories: [
    { id: 'acc-band', name: 'Headband', price: 0, rarity: RARITY.COMMON, owned: true },
    { id: 'acc-shades', name: 'Shades', price: 80, rarity: RARITY.RARE },
    { id: 'acc-wrist', name: 'Wrist Wrap', price: 140, rarity: RARITY.EPIC },
    { id: 'acc-jetpin', name: 'Jet Pin', price: 260, rarity: RARITY.LEGENDARY },
  ],
};

/**
 * PUBLIC_INTERFACE
 * Helper to get catalog item by id.
 */
export function getCatalogItemById(id) {
  /** Returns an item object (outfit/accessory) or null if not found. */
  const all = [...cosmeticsCatalog.outfits, ...cosmeticsCatalog.accessories];
  return all.find((i) => i.id === id) || null;
}

//
// CosmeticsService: thin layer over api/endpoints with mock fallbacks and optimistic helpers
//
import { cosmeticsApi } from '../../api/endpoints';
import { cosmeticsCatalog, getCatalogItemById } from './catalog';
import { logger } from '../../utils/logger';

// PUBLIC_INTERFACE
export const CosmeticsService = {
  /**
   * Fetch available cosmetics; uses backend if available, else falls back to local catalog.
   * @returns {Promise<{outfits:Array, accessories:Array}>}
   */
  async list() {
    try {
      const data = await cosmeticsApi.list();
      if (data && (Array.isArray(data.outfits) || Array.isArray(data.accessories))) {
        return data;
      }
    } catch (e) {
      logger.warn('[CosmeticsService.list] api failed, using catalog', e);
    }
    return cosmeticsCatalog;
  },

  /**
   * Attempt purchase. On backend failure, treat as success if item exists.
   * @param {string} itemId
   * @returns {Promise<{success:boolean,itemId:string,price:number}>}
   */
  async purchase(itemId) {
    const item = getCatalogItemById(itemId);
    if (!item) {
      return { success: false, itemId, price: 0 };
    }
    try {
      const res = await cosmeticsApi.purchase({ itemId });
      return { success: !!res?.success, itemId, price: item.price || 0 };
    } catch (e) {
      logger.warn('[CosmeticsService.purchase] fallback success', e);
      return { success: true, itemId, price: item.price || 0 };
    }
  },

  /**
   * Equip item. On backend failure, treat as success.
   * @param {string} itemId
   * @returns {Promise<{success:boolean,itemId:string}>}
   */
  async equip(itemId) {
    try {
      const res = await cosmeticsApi.equip({ itemId });
      return { success: !!res?.success, itemId };
    } catch (e) {
      logger.warn('[CosmeticsService.equip] fallback success', e);
      return { success: true, itemId };
    }
  },
};

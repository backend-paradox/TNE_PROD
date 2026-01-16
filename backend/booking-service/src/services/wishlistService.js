const prisma = require('../config/prisma');

class WishlistService {
  /**
   * Get all wishlist items for a user
   */
  async getWishlist(userId) {
    const items = await prisma.wishlistItem.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    return {
      items: items.map((item) => this.formatWishlistItem(item)),
      count: items.length,
    };
  }

  /**
   * Check if a package is in user's wishlist
   */
  async isInWishlist(userId, packageId, packageType = 'tour') {
    const item = await prisma.wishlistItem.findUnique({
      where: {
        userId_packageId_packageType: {
          userId,
          packageId,
          packageType,
        },
      },
    });
    return !!item;
  }

  /**
   * Add item to wishlist
   */
  async addToWishlist(userId, itemData) {
    const {
      packageId,
      type,
      name,
      slug,
      image,
      price,
      duration,
      destination,
    } = itemData;

    // Check if item already exists
    const existingItem = await prisma.wishlistItem.findUnique({
      where: {
        userId_packageId_packageType: {
          userId,
          packageId,
          packageType: type,
        },
      },
    });

    if (existingItem) {
      return this.formatWishlistItem(existingItem);
    }

    // Create new wishlist item
    const newItem = await prisma.wishlistItem.create({
      data: {
        userId,
        packageId,
        packageType: type,
        packageName: name,
        packageSlug: slug,
        packageImage: image,
        packagePrice: price,
        duration,
        destination,
      },
    });

    return this.formatWishlistItem(newItem);
  }

  /**
   * Toggle wishlist item (add if not exists, remove if exists)
   */
  async toggleWishlist(userId, itemData) {
    const { packageId, type } = itemData;

    const existingItem = await prisma.wishlistItem.findUnique({
      where: {
        userId_packageId_packageType: {
          userId,
          packageId,
          packageType: type,
        },
      },
    });

    if (existingItem) {
      await prisma.wishlistItem.delete({ where: { id: existingItem.id } });
      return { action: 'removed', item: null };
    }

    const newItem = await this.addToWishlist(userId, itemData);
    return { action: 'added', item: newItem };
  }

  /**
   * Remove item from wishlist
   */
  async removeFromWishlist(userId, packageId, packageType = 'tour') {
    const item = await prisma.wishlistItem.findUnique({
      where: {
        userId_packageId_packageType: {
          userId,
          packageId,
          packageType,
        },
      },
    });

    if (!item) {
      throw new Error('Wishlist item not found');
    }

    if (item.userId !== userId) {
      throw new Error('Unauthorized');
    }

    await prisma.wishlistItem.delete({ where: { id: item.id } });
    return true;
  }

  /**
   * Clear all items from wishlist
   */
  async clearWishlist(userId) {
    await prisma.wishlistItem.deleteMany({ where: { userId } });
    return true;
  }

  /**
   * Get wishlist IDs only (for quick lookup)
   */
  async getWishlistIds(userId) {
    const items = await prisma.wishlistItem.findMany({
      where: { userId },
      select: { packageId: true, packageType: true },
    });

    return items.map((item) => ({
      packageId: item.packageId,
      type: item.packageType,
    }));
  }

  /**
   * Format wishlist item for response
   */
  formatWishlistItem(item) {
    return {
      id: item.id,
      packageId: item.packageId,
      type: item.packageType,
      name: item.packageName,
      slug: item.packageSlug,
      image: item.packageImage,
      price: Number(item.packagePrice),
      duration: item.duration,
      destination: item.destination,
      createdAt: item.createdAt,
    };
  }
}

module.exports = new WishlistService();

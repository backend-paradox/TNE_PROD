const prisma = require('../config/prisma');

class CartService {
  /**
   * Get all cart items for a user
   */
  async getCart(userId) {
    const items = await prisma.cartItem.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    // Calculate totals
    const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
    const totalPrice = items.reduce(
      (sum, item) => sum + Number(item.packagePrice) * item.quantity,
      0
    );

    return {
      items: items.map((item) => ({
        id: item.id,
        packageId: item.packageId,
        type: item.packageType,
        name: item.packageName,
        slug: item.packageSlug,
        image: item.packageImage,
        price: Number(item.packagePrice),
        duration: item.duration,
        quantity: item.quantity,
        createdAt: item.createdAt,
      })),
      totalItems,
      totalPrice: parseFloat(totalPrice.toFixed(2)),
    };
  }

  /**
   * Add item to cart (or update quantity if exists)
   */
  async addToCart(userId, itemData) {
    const {
      packageId,
      type,
      name,
      slug,
      image,
      price,
      duration,
      quantity = 1,
    } = itemData;

    // Check if item already exists in cart
    const existingItem = await prisma.cartItem.findUnique({
      where: {
        userId_packageId_packageType: {
          userId,
          packageId,
          packageType: type,
        },
      },
    });

    if (existingItem) {
      // Update quantity
      const updatedItem = await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: existingItem.quantity + quantity },
      });
      return this.formatCartItem(updatedItem);
    }

    // Create new cart item
    const newItem = await prisma.cartItem.create({
      data: {
        userId,
        packageId,
        packageType: type,
        packageName: name,
        packageSlug: slug,
        packageImage: image,
        packagePrice: price,
        duration,
        quantity,
      },
    });

    return this.formatCartItem(newItem);
  }

  /**
   * Update cart item quantity
   */
  async updateCartItem(userId, itemId, quantity) {
    // Verify ownership
    const item = await prisma.cartItem.findFirst({
      where: { id: itemId, userId },
    });

    if (!item) {
      throw new Error('Cart item not found');
    }

    if (quantity <= 0) {
      // Remove item if quantity is 0 or less
      await prisma.cartItem.delete({ where: { id: itemId } });
      return null;
    }

    const updatedItem = await prisma.cartItem.update({
      where: { id: itemId },
      data: { quantity },
    });

    return this.formatCartItem(updatedItem);
  }

  /**
   * Remove item from cart
   */
  async removeFromCart(userId, itemId) {
    // Verify ownership
    const item = await prisma.cartItem.findFirst({
      where: { id: itemId, userId },
    });

    if (!item) {
      throw new Error('Cart item not found');
    }

    await prisma.cartItem.delete({ where: { id: itemId } });
    return true;
  }

  /**
   * Clear all items from cart
   */
  async clearCart(userId) {
    await prisma.cartItem.deleteMany({ where: { userId } });
    return true;
  }

  /**
   * Format cart item for response
   */
  formatCartItem(item) {
    return {
      id: item.id,
      packageId: item.packageId,
      type: item.packageType,
      name: item.packageName,
      slug: item.packageSlug,
      image: item.packageImage,
      price: Number(item.packagePrice),
      duration: item.duration,
      quantity: item.quantity,
      createdAt: item.createdAt,
    };
  }
}

module.exports = new CartService();

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Get user's wishlist
 */
const getWishlist = async (req, res) => {
  try {
    const userId = req.user.id;
    const { type, page = 1, limit = 20 } = req.query;

    const where = { userProfileId: userId };
    if (type) {
      where.itemType = type.toUpperCase();
    }

    const [items, total] = await Promise.all([
      prisma.wishlistItem.findMany({
        where,
        orderBy: [
          { priority: 'desc' },
          { createdAt: 'desc' }
        ],
        skip: (page - 1) * limit,
        take: parseInt(limit)
      }),
      prisma.wishlistItem.count({ where })
    ]);

    res.json({
      success: true,
      data: items,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get wishlist error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Add item to wishlist
 */
const addToWishlist = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      itemType,
      itemId,
      itemName,
      itemImage,
      itemPrice,
      itemCurrency,
      itemDestination,
      itemMetadata,
      notes,
      priority
    } = req.body;

    // Check if already in wishlist
    const existing = await prisma.wishlistItem.findUnique({
      where: {
        userProfileId_itemType_itemId: {
          userProfileId: userId,
          itemType: itemType.toUpperCase(),
          itemId
        }
      }
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'Item already in wishlist'
      });
    }

    const item = await prisma.wishlistItem.create({
      data: {
        userProfileId: userId,
        itemType: itemType.toUpperCase(),
        itemId,
        itemName,
        itemImage,
        itemPrice,
        itemCurrency: itemCurrency || 'INR',
        itemDestination,
        itemMetadata,
        notes,
        priority: priority || 0
      }
    });

    res.status(201).json({
      success: true,
      message: 'Added to wishlist',
      data: item
    });
  } catch (error) {
    console.error('Add to wishlist error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Update wishlist item
 */
const updateWishlistItem = async (req, res) => {
  try {
    const userId = req.user.id;
    const { itemId } = req.params;
    const { notes, priority } = req.body;

    const item = await prisma.wishlistItem.findFirst({
      where: {
        id: parseInt(itemId),
        userProfileId: userId
      }
    });

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Wishlist item not found'
      });
    }

    const updated = await prisma.wishlistItem.update({
      where: { id: parseInt(itemId) },
      data: {
        notes: notes !== undefined ? notes : item.notes,
        priority: priority !== undefined ? priority : item.priority
      }
    });

    res.json({
      success: true,
      message: 'Wishlist item updated',
      data: updated
    });
  } catch (error) {
    console.error('Update wishlist error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Remove item from wishlist
 */
const removeFromWishlist = async (req, res) => {
  try {
    const userId = req.user.id;
    const { itemId } = req.params;

    const item = await prisma.wishlistItem.findFirst({
      where: {
        id: parseInt(itemId),
        userProfileId: userId
      }
    });

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Wishlist item not found'
      });
    }

    await prisma.wishlistItem.delete({
      where: { id: parseInt(itemId) }
    });

    res.json({
      success: true,
      message: 'Removed from wishlist'
    });
  } catch (error) {
    console.error('Remove from wishlist error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Check if item is in wishlist
 */
const checkWishlist = async (req, res) => {
  try {
    const userId = req.user.id;
    const { itemType, itemId } = req.query;

    const item = await prisma.wishlistItem.findUnique({
      where: {
        userProfileId_itemType_itemId: {
          userProfileId: userId,
          itemType: itemType.toUpperCase(),
          itemId
        }
      }
    });

    res.json({
      success: true,
      data: {
        isInWishlist: !!item,
        item: item || null
      }
    });
  } catch (error) {
    console.error('Check wishlist error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Clear entire wishlist
 */
const clearWishlist = async (req, res) => {
  try {
    const userId = req.user.id;
    const { type } = req.query;

    const where = { userProfileId: userId };
    if (type) {
      where.itemType = type.toUpperCase();
    }

    const result = await prisma.wishlistItem.deleteMany({ where });

    res.json({
      success: true,
      message: `Cleared ${result.count} items from wishlist`
    });
  } catch (error) {
    console.error('Clear wishlist error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getWishlist,
  addToWishlist,
  updateWishlistItem,
  removeFromWishlist,
  checkWishlist,
  clearWishlist
};

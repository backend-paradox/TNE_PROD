const prisma = require('../config/prisma');

class CatalogService {
  /**
   * Get all active destinations
   */
  async getDestinations() {
    const destinations = await prisma.destination.findMany({
      where: { isActive: true },
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
      include: {
        _count: {
          select: { packages: true }
        }
      }
    });

    return destinations.map(dest => ({
      ...dest,
      packageCount: dest._count.packages
    }));
  }

  /**
   * Get destination by slug with its packages
   */
  async getDestinationBySlug(slug) {
    const destination = await prisma.destination.findUnique({
      where: { slug },
      include: {
        packages: {
          where: { isActive: true },
          orderBy: [{ featured: 'desc' }, { sortOrder: 'asc' }]
        }
      }
    });

    return destination;
  }

  /**
   * Search packages with filters
   * @param {Object} filters - Search filters
   * @param {string} filters.destination - Destination slug or name
   * @param {string} filters.tripType - Trip type (leisure, family, honeymoon, adventure)
   * @param {number} filters.minBudget - Minimum price
   * @param {number} filters.maxBudget - Maximum price
   * @param {number} filters.travelers - Number of travelers
   * @param {number} filters.page - Page number
   * @param {number} filters.limit - Items per page
   */
  async searchPackages(filters = {}) {
    const {
      destination,
      tripType,
      minBudget,
      maxBudget,
      travelers,
      featured,
      page = 1,
      limit = 10
    } = filters;

    const where = {
      isActive: true
    };

    // Filter by destination
    if (destination) {
      where.destination = {
        OR: [
          { slug: { contains: destination.toLowerCase() } },
          { name: { contains: destination, mode: 'insensitive' } }
        ]
      };
    }

    // Filter by trip type
    if (tripType) {
      where.tripType = tripType.toLowerCase();
    }

    // Filter by budget range
    if (minBudget || maxBudget) {
      where.price = {};
      if (minBudget) where.price.gte = parseFloat(minBudget);
      if (maxBudget) where.price.lte = parseFloat(maxBudget);
    }

    // Filter by travelers capacity
    if (travelers) {
      const travelerCount = parseInt(travelers);
      where.minTravelers = { lte: travelerCount };
      where.maxTravelers = { gte: travelerCount };
    }

    // Filter featured packages
    if (featured === 'true' || featured === true) {
      where.featured = true;
    }

    const skip = (page - 1) * limit;

    const [packages, total] = await Promise.all([
      prisma.package.findMany({
        where,
        include: {
          destination: {
            select: { id: true, name: true, slug: true }
          }
        },
        orderBy: [{ featured: 'desc' }, { sortOrder: 'asc' }, { rating: 'desc' }],
        skip,
        take: parseInt(limit)
      }),
      prisma.package.count({ where })
    ]);

    return {
      packages,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  /**
   * Get package by packageId (e.g., PKG_GOA_001)
   */
  async getPackageById(packageId) {
    const pkg = await prisma.package.findUnique({
      where: { packageId },
      include: {
        destination: true
      }
    });

    return pkg;
  }

  /**
   * Check package availability
   * @param {string} packageId - Package ID
   * @param {number} travelers - Number of travelers
   * @param {string} date - Travel date (optional)
   */
  async checkAvailability(packageId, travelers = 1, date = null) {
    const pkg = await prisma.package.findUnique({
      where: { packageId },
      select: {
        packageId: true,
        title: true,
        availability: true,
        minTravelers: true,
        maxTravelers: true,
        isActive: true,
        price: true,
        discountPrice: true
      }
    });

    if (!pkg) {
      return { available: false, reason: 'Package not found' };
    }

    if (!pkg.isActive) {
      return { available: false, reason: 'Package is currently unavailable' };
    }

    const travelerCount = parseInt(travelers);

    if (travelerCount < pkg.minTravelers) {
      return {
        available: false,
        reason: `Minimum ${pkg.minTravelers} travelers required`
      };
    }

    if (travelerCount > pkg.maxTravelers) {
      return {
        available: false,
        reason: `Maximum ${pkg.maxTravelers} travelers allowed`
      };
    }

    if (pkg.availability < travelerCount) {
      return {
        available: false,
        reason: `Only ${pkg.availability} slots available`
      };
    }

    // Calculate total price
    const pricePerPerson = pkg.discountPrice || pkg.price;
    const totalPrice = parseFloat(pricePerPerson) * travelerCount;

    return {
      available: true,
      packageId: pkg.packageId,
      title: pkg.title,
      slotsAvailable: pkg.availability,
      travelers: travelerCount,
      pricePerPerson: parseFloat(pricePerPerson),
      totalPrice,
      travelDate: date
    };
  }

  /**
   * Get featured packages for homepage/chatbot suggestions
   */
  async getFeaturedPackages(limit = 5) {
    const packages = await prisma.package.findMany({
      where: {
        isActive: true,
        featured: true
      },
      include: {
        destination: {
          select: { id: true, name: true, slug: true }
        }
      },
      orderBy: [{ sortOrder: 'asc' }, { rating: 'desc' }],
      take: limit
    });

    return packages;
  }

  /**
   * Get packages by destination name (for chatbot)
   */
  async getPackagesByDestination(destinationName) {
    const packages = await prisma.package.findMany({
      where: {
        isActive: true,
        destination: {
          name: { contains: destinationName, mode: 'insensitive' }
        }
      },
      include: {
        destination: {
          select: { id: true, name: true, slug: true }
        }
      },
      orderBy: [{ featured: 'desc' }, { price: 'asc' }]
    });

    return packages;
  }

  /**
   * Search destinations by name (for chatbot autocomplete)
   */
  async searchDestinations(query) {
    const destinations = await prisma.destination.findMany({
      where: {
        isActive: true,
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { state: { contains: query, mode: 'insensitive' } }
        ]
      },
      orderBy: { name: 'asc' },
      take: 5
    });

    return destinations;
  }

  /**
   * Get trip types with counts
   */
  async getTripTypes() {
    const tripTypes = await prisma.package.groupBy({
      by: ['tripType'],
      where: { isActive: true },
      _count: { tripType: true }
    });

    return tripTypes.map(t => ({
      type: t.tripType,
      count: t._count.tripType
    }));
  }
}

module.exports = new CatalogService();

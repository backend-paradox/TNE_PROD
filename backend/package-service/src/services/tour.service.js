const prisma = require('../config/prisma');

class TourService {
  // Get all tour packages with optional filters
  async getAll(filters = {}) {
    const where = { isActive: true };

    if (filters.category) {
      where.category = filters.category;
    }
    if (filters.country) {
      where.country = filters.country;
    }
    if (filters.trending !== undefined) {
      where.trending = filters.trending === 'true';
    }
    if (filters.popular !== undefined) {
      where.popular = filters.popular === 'true';
    }
    if (filters.tags && filters.tags.length > 0) {
      where.tags = { hasSome: Array.isArray(filters.tags) ? filters.tags : [filters.tags] };
    }

    return prisma.tourPackage.findMany({
      where,
      orderBy: [
        { sortOrder: 'asc' },
        { createdAt: 'desc' }
      ]
    });
  }

  // Get by slug
  async getBySlug(slug) {
    return prisma.tourPackage.findFirst({
      where: { slug, isActive: true }
    });
  }

  // Get by ID
  async getById(id) {
    return prisma.tourPackage.findUnique({
      where: { id }
    });
  }

  // Get trending packages
  async getTrending(limit = 4) {
    return prisma.tourPackage.findMany({
      where: { trending: true, isActive: true },
      take: limit,
      orderBy: { sortOrder: 'asc' }
    });
  }

  // Get popular packages
  async getPopular(limit = 8) {
    return prisma.tourPackage.findMany({
      where: { popular: true, isActive: true },
      take: limit,
      orderBy: { sortOrder: 'asc' }
    });
  }

  // Get domestic packages (India)
  async getDomestic(limit) {
    const query = {
      where: { country: 'India', isActive: true },
      orderBy: { sortOrder: 'asc' }
    };
    if (limit) query.take = limit;
    return prisma.tourPackage.findMany(query);
  }

  // Get international packages (not India)
  async getInternational(limit) {
    const query = {
      where: { country: { not: 'India' }, isActive: true },
      orderBy: { sortOrder: 'asc' }
    };
    if (limit) query.take = limit;
    return prisma.tourPackage.findMany(query);
  }

  // Get by tags
  async getByTags(tags) {
    const tagArray = Array.isArray(tags) ? tags : tags.split(',');
    return prisma.tourPackage.findMany({
      where: {
        tags: { hasSome: tagArray },
        isActive: true
      },
      orderBy: { sortOrder: 'asc' }
    });
  }

  // Get visa-free international packages
  async getVisaFree(limit = 8) {
    const query = {
      where: {
        visaRequired: false,
        country: { not: 'India' },
        isActive: true
      },
      orderBy: { sortOrder: 'asc' }
    };
    if (limit) query.take = limit;
    return prisma.tourPackage.findMany(query);
  }

  // Get packages by continent
  async getByContinent(continent, limit) {
    const query = {
      where: {
        continent: continent,
        isActive: true
      },
      orderBy: { sortOrder: 'asc' }
    };
    if (limit) query.take = limit;
    return prisma.tourPackage.findMany(query);
  }

  // Get packages by duration range (parses duration string like "5 Days / 4 Nights")
  async getByDuration(minDays = 1, maxDays = 99, limit) {
    // First get all active packages
    const packages = await prisma.tourPackage.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' }
    });

    // Filter by duration (parse days from duration string)
    const filtered = packages.filter(pkg => {
      const match = pkg.duration.match(/(\d+)\s*Days?/i);
      if (match) {
        const days = parseInt(match[1], 10);
        return days >= minDays && days <= maxDays;
      }
      return false;
    });

    return limit ? filtered.slice(0, limit) : filtered;
  }

  // Search packages by query and optional category filter
  async search(query, category = null, limit = 10) {
    const where = { isActive: true };

    // Category filter
    if (category === 'domestic') {
      where.country = 'India';
    } else if (category === 'international') {
      where.country = { not: 'India' };
    }

    // Text search across multiple fields
    if (query && query.trim()) {
      const searchTerm = query.trim();
      where.OR = [
        { name: { contains: searchTerm, mode: 'insensitive' } },
        { destination: { contains: searchTerm, mode: 'insensitive' } },
        { state: { contains: searchTerm, mode: 'insensitive' } },
        { country: { contains: searchTerm, mode: 'insensitive' } },
        { tagline: { contains: searchTerm, mode: 'insensitive' } },
      ];
    }

    return prisma.tourPackage.findMany({
      where,
      take: limit,
      orderBy: [
        { popular: 'desc' },
        { sortOrder: 'asc' }
      ],
      select: {
        id: true,
        slug: true,
        name: true,
        destination: true,
        state: true,
        country: true,
        startingPrice: true,
        imageUrl: true,
        duration: true,
        rating: true,
      }
    });
  }

  // Create new package
  async create(data) {
    return prisma.tourPackage.create({ data });
  }

  // Update package
  async update(id, data) {
    return prisma.tourPackage.update({
      where: { id },
      data
    });
  }

  // Delete package (soft delete)
  async delete(id) {
    return prisma.tourPackage.update({
      where: { id },
      data: { isActive: false }
    });
  }

  // Bulk create (for seeding)
  async bulkCreate(packages) {
    return prisma.tourPackage.createMany({
      data: packages,
      skipDuplicates: true
    });
  }

  // Delete all (for reseeding)
  async deleteAll() {
    return prisma.tourPackage.deleteMany({});
  }
}

module.exports = new TourService();

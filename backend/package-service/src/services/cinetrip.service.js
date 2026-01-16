const prisma = require('../config/prisma');

class CineTripService {
  // Get all cinetrip packages with optional filters
  async getAll(filters = {}) {
    const where = { isActive: true };

    if (filters.category) {
      where.category = filters.category;
    }
    if (filters.featured !== undefined) {
      where.featured = filters.featured === 'true';
    }
    if (filters.popular !== undefined) {
      where.popular = filters.popular === 'true';
    }

    return prisma.cineTripPackage.findMany({
      where,
      orderBy: [
        { sortOrder: 'asc' },
        { createdAt: 'desc' }
      ]
    });
  }

  // Get by slug
  async getBySlug(slug) {
    return prisma.cineTripPackage.findUnique({
      where: { slug, isActive: true }
    });
  }

  // Get by ID
  async getById(id) {
    return prisma.cineTripPackage.findUnique({
      where: { id }
    });
  }

  // Get featured packages
  async getFeatured(limit = 8) {
    return prisma.cineTripPackage.findMany({
      where: { featured: true, isActive: true },
      take: limit,
      orderBy: { sortOrder: 'asc' }
    });
  }

  // Get by category
  async getByCategory(category) {
    return prisma.cineTripPackage.findMany({
      where: { category, isActive: true },
      orderBy: { sortOrder: 'asc' }
    });
  }

  // Create new package
  async create(data) {
    return prisma.cineTripPackage.create({ data });
  }

  // Update package
  async update(id, data) {
    return prisma.cineTripPackage.update({
      where: { id },
      data
    });
  }

  // Delete package (soft delete)
  async delete(id) {
    return prisma.cineTripPackage.update({
      where: { id },
      data: { isActive: false }
    });
  }

  // Bulk create (for seeding)
  async bulkCreate(packages) {
    return prisma.cineTripPackage.createMany({
      data: packages,
      skipDuplicates: true
    });
  }

  // Delete all (for reseeding)
  async deleteAll() {
    return prisma.cineTripPackage.deleteMany({});
  }
}

module.exports = new CineTripService();

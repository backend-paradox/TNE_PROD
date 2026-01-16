/**
 * BaseRepository - Abstract base class for all repositories
 *
 * Provides common CRUD operations and query patterns.
 * All service-specific repositories should extend this class.
 *
 * Usage:
 *   class UserRepository extends BaseRepository {
 *     constructor(prisma) {
 *       super(prisma, 'user');
 *     }
 *   }
 */

class BaseRepository {
  /**
   * @param {import('@prisma/client').PrismaClient} prisma - Prisma client instance
   * @param {string} modelName - Prisma model name (e.g., 'user', 'booking')
   */
  constructor(prisma, modelName) {
    if (!prisma) {
      throw new Error('Prisma client is required');
    }
    if (!modelName) {
      throw new Error('Model name is required');
    }
    this.prisma = prisma;
    this.model = prisma[modelName];
    this.modelName = modelName;

    if (!this.model) {
      throw new Error(`Model '${modelName}' not found in Prisma client`);
    }
  }

  /**
   * Find a single record by ID
   * @param {number|string} id - Record ID
   * @param {Object} options - Prisma findUnique options (select, include)
   * @returns {Promise<Object|null>}
   */
  async findById(id, options = {}) {
    return this.model.findUnique({
      where: { id },
      ...options,
    });
  }

  /**
   * Find a single record by unique field
   * @param {Object} where - Unique field criteria
   * @param {Object} options - Prisma findUnique options
   * @returns {Promise<Object|null>}
   */
  async findOne(where, options = {}) {
    return this.model.findUnique({
      where,
      ...options,
    });
  }

  /**
   * Find first matching record
   * @param {Object} where - Filter criteria
   * @param {Object} options - Prisma findFirst options
   * @returns {Promise<Object|null>}
   */
  async findFirst(where, options = {}) {
    return this.model.findFirst({
      where,
      ...options,
    });
  }

  /**
   * Find all records matching criteria
   * @param {Object} where - Filter criteria
   * @param {Object} options - Prisma findMany options
   * @returns {Promise<Array>}
   */
  async findAll(where = {}, options = {}) {
    return this.model.findMany({
      where,
      ...options,
    });
  }

  /**
   * Find records with pagination
   * @param {Object} params - Pagination parameters
   * @param {Object} params.where - Filter criteria
   * @param {number} params.page - Page number (1-indexed)
   * @param {number} params.limit - Items per page
   * @param {Object} params.orderBy - Sort order
   * @param {Object} params.select - Fields to select
   * @param {Object} params.include - Relations to include
   * @returns {Promise<{data: Array, pagination: Object}>}
   */
  async findWithPagination({
    where = {},
    page = 1,
    limit = 20,
    orderBy = { createdAt: 'desc' },
    select,
    include,
  }) {
    const validPage = Math.max(1, parseInt(page, 10) || 1);
    const validLimit = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
    const skip = (validPage - 1) * validLimit;

    const queryOptions = {
      where,
      orderBy,
      skip,
      take: validLimit,
    };

    if (select) queryOptions.select = select;
    if (include) queryOptions.include = include;

    const [data, total] = await Promise.all([
      this.model.findMany(queryOptions),
      this.model.count({ where }),
    ]);

    return {
      data,
      pagination: {
        page: validPage,
        limit: validLimit,
        total,
        totalPages: Math.ceil(total / validLimit),
        hasNext: validPage * validLimit < total,
        hasPrev: validPage > 1,
      },
    };
  }

  /**
   * Create a new record
   * @param {Object} data - Record data
   * @param {Object} options - Prisma create options
   * @returns {Promise<Object>}
   */
  async create(data, options = {}) {
    return this.model.create({
      data,
      ...options,
    });
  }

  /**
   * Create multiple records
   * @param {Array} data - Array of record data
   * @returns {Promise<{count: number}>}
   */
  async createMany(data) {
    return this.model.createMany({
      data,
      skipDuplicates: true,
    });
  }

  /**
   * Update a record by ID
   * @param {number|string} id - Record ID
   * @param {Object} data - Update data
   * @param {Object} options - Prisma update options
   * @returns {Promise<Object>}
   */
  async updateById(id, data, options = {}) {
    return this.model.update({
      where: { id },
      data,
      ...options,
    });
  }

  /**
   * Update a record by unique field
   * @param {Object} where - Unique field criteria
   * @param {Object} data - Update data
   * @param {Object} options - Prisma update options
   * @returns {Promise<Object>}
   */
  async update(where, data, options = {}) {
    return this.model.update({
      where,
      data,
      ...options,
    });
  }

  /**
   * Update multiple records
   * @param {Object} where - Filter criteria
   * @param {Object} data - Update data
   * @returns {Promise<{count: number}>}
   */
  async updateMany(where, data) {
    return this.model.updateMany({
      where,
      data,
    });
  }

  /**
   * Create or update a record
   * @param {Object} params - Upsert parameters
   * @param {Object} params.where - Unique identifier
   * @param {Object} params.create - Data for create
   * @param {Object} params.update - Data for update
   * @param {Object} options - Prisma upsert options
   * @returns {Promise<Object>}
   */
  async upsert({ where, create, update }, options = {}) {
    return this.model.upsert({
      where,
      create,
      update,
      ...options,
    });
  }

  /**
   * Delete a record by ID
   * @param {number|string} id - Record ID
   * @returns {Promise<Object>}
   */
  async deleteById(id) {
    return this.model.delete({
      where: { id },
    });
  }

  /**
   * Delete a record by unique field
   * @param {Object} where - Unique field criteria
   * @returns {Promise<Object>}
   */
  async delete(where) {
    return this.model.delete({
      where,
    });
  }

  /**
   * Delete multiple records
   * @param {Object} where - Filter criteria
   * @returns {Promise<{count: number}>}
   */
  async deleteMany(where) {
    return this.model.deleteMany({
      where,
    });
  }

  /**
   * Count records matching criteria
   * @param {Object} where - Filter criteria
   * @returns {Promise<number>}
   */
  async count(where = {}) {
    return this.model.count({ where });
  }

  /**
   * Check if a record exists
   * @param {Object} where - Filter criteria
   * @returns {Promise<boolean>}
   */
  async exists(where) {
    const count = await this.model.count({ where });
    return count > 0;
  }

  /**
   * Execute operations in a transaction
   * @param {Function} callback - Function receiving transaction client
   * @returns {Promise<any>}
   */
  async transaction(callback) {
    return this.prisma.$transaction(callback);
  }

  /**
   * Execute raw SQL query
   * @param {string} query - SQL query
   * @param {Array} params - Query parameters
   * @returns {Promise<any>}
   */
  async rawQuery(query, params = []) {
    return this.prisma.$queryRawUnsafe(query, ...params);
  }

  /**
   * Aggregate query (count, sum, avg, min, max)
   * @param {Object} options - Prisma aggregate options
   * @returns {Promise<Object>}
   */
  async aggregate(options) {
    return this.model.aggregate(options);
  }

  /**
   * Group by query
   * @param {Object} options - Prisma groupBy options
   * @returns {Promise<Array>}
   */
  async groupBy(options) {
    return this.model.groupBy(options);
  }
}

module.exports = BaseRepository;

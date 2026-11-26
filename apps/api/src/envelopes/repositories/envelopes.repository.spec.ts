import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Category } from '@/categories/entities/category.entity';
import { Envelope } from '@/envelopes/entities/envelope.entity';
import { ENVELOPE_WARNING_THRESHOLD } from '@/envelopes/utils/envelope-status';
import { EnvelopesRepository } from './envelopes.repository';

describe('EnvelopesRepository', () => {
  let repository: EnvelopesRepository;
  let mockRepository: jest.Mocked<Repository<Envelope>>;

  const mockCategory: Category = {
    id: 'cat-1',
    userId: 'user-123',
    label: 'Food',
    color: 'oklch(0.72 0.14 153)',
    icon: 'utensils',
    isDefault: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockEnvelope: Envelope = {
    id: 'envelope-123',
    name: 'Groceries',
    amount: 500,
    currency: 'COP',
    spent: 200,
    userId: 'user-123',
    category: mockCategory,
    categoryId: mockCategory.id,
    description: 'Monthly groceries',
    expenses: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  // Chainable createQueryBuilder mock - each method returns `this` like the
  // real QueryBuilder, so findByUserIdLight's chained calls resolve to it.
  let mockQueryBuilder: {
    where: jest.Mock;
    leftJoin: jest.Mock;
    andWhere: jest.Mock;
    select: jest.Mock;
    addSelect: jest.Mock;
    orderBy: jest.Mock;
    addOrderBy: jest.Mock;
    offset: jest.Mock;
    limit: jest.Mock;
    getManyAndCount: jest.Mock;
  };

  beforeEach(async () => {
    mockQueryBuilder = {
      where: jest.fn().mockReturnThis(),
      leftJoin: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      addSelect: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      addOrderBy: jest.fn().mockReturnThis(),
      offset: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      getManyAndCount: jest.fn(),
    };

    // Create mock repository
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    mockRepository = {
      findAndCount: jest.fn(),
      createQueryBuilder: jest.fn().mockReturnValue(mockQueryBuilder),
      findOneBy: jest.fn(),
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
      increment: jest.fn(),
      decrement: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EnvelopesRepository,
        {
          provide: getRepositoryToken(Envelope),
          useValue: mockRepository,
        },
      ],
    }).compile();

    repository = module.get<EnvelopesRepository>(EnvelopesRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findByUserIdLight', () => {
    it('should find a page of envelopes without expenses', async () => {
      // Arrange
      const userId = 'user-123';
      mockQueryBuilder.getManyAndCount.mockResolvedValue([[mockEnvelope], 1]);

      // Act
      const result = await repository.findByUserIdLight(userId, 1, 20);

      // Assert
      expect(result).toEqual([[mockEnvelope], 1]);
      expect(mockRepository.createQueryBuilder).toHaveBeenCalledWith(
        'envelope',
      );
      expect(mockQueryBuilder.where).toHaveBeenCalledWith(
        'envelope.userId = :userId',
        { userId },
      );
      expect(mockQueryBuilder.andWhere).not.toHaveBeenCalled();
      // Newest period first by default; the real ordering is asserted
      // against Postgres in envelopes.e2e-spec.ts.
      expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith(
        'period_end',
        'DESC',
      );
      expect(mockQueryBuilder.offset).toHaveBeenCalledWith(0);
      expect(mockQueryBuilder.limit).toHaveBeenCalledWith(20);
    });

    it('should compute the correct offset for page 3', async () => {
      // Arrange
      mockQueryBuilder.getManyAndCount.mockResolvedValue([[], 0]);

      // Act
      await repository.findByUserIdLight('user-123', 3, 20);

      // Assert
      expect(mockQueryBuilder.offset).toHaveBeenCalledWith(40);
      expect(mockQueryBuilder.limit).toHaveBeenCalledWith(20);
    });

    it('should filter by search term across name and category', async () => {
      // Arrange
      mockQueryBuilder.getManyAndCount.mockResolvedValue([[mockEnvelope], 1]);

      // Act
      await repository.findByUserIdLight('user-123', 1, 20, {
        search: '100%_grocer',
      });

      // Assert
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        "(LOWER(envelope.name) LIKE LOWER(:search) ESCAPE '\\' OR LOWER(category.label) LIKE LOWER(:search) ESCAPE '\\')",
        { search: '%100\\%\\_grocer%' },
      );
    });

    it('should filter by derived status in SQL, not in memory', async () => {
      // Arrange
      mockQueryBuilder.getManyAndCount.mockResolvedValue([[mockEnvelope], 1]);

      // Act
      await repository.findByUserIdLight('user-123', 1, 20, {
        status: 'alert',
      });

      // Assert - the threshold arrives as a parameter, never inlined, so
      // it cannot drift from ENVELOPE_WARNING_THRESHOLD.
      const calls = mockQueryBuilder.andWhere.mock.calls as [
        string,
        Record<string, unknown>?,
      ][];
      const alertCall = calls.find(([clause]) =>
        clause.includes('warningThreshold'),
      );
      expect(alertCall).toBeDefined();
      expect(alertCall?.[1]).toEqual({
        warningThreshold: ENVELOPE_WARNING_THRESHOLD,
      });
    });

    it('should filter unlimited envelopes on amount IS NULL', async () => {
      // Arrange
      mockQueryBuilder.getManyAndCount.mockResolvedValue([[mockEnvelope], 1]);

      // Act
      await repository.findByUserIdLight('user-123', 1, 20, {
        status: 'unlimited',
      });

      // Assert
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        '(envelope.amount IS NULL)',
        {},
      );
    });

    it('should combine search and status rather than replacing one', async () => {
      // Arrange
      mockQueryBuilder.getManyAndCount.mockResolvedValue([[mockEnvelope], 1]);

      // Act
      await repository.findByUserIdLight('user-123', 1, 20, {
        search: 'grocer',
        status: 'exceeded',
      });

      // Assert
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledTimes(2);
    });

    it('should add no status clause for "all"', async () => {
      // Arrange
      mockQueryBuilder.getManyAndCount.mockResolvedValue([[mockEnvelope], 1]);

      // Act
      await repository.findByUserIdLight('user-123', 1, 20, { status: 'all' });

      // Assert
      expect(mockQueryBuilder.andWhere).not.toHaveBeenCalled();
    });

    it('should not filter when search is omitted', async () => {
      // Arrange
      mockQueryBuilder.getManyAndCount.mockResolvedValue([[mockEnvelope], 1]);

      // Act
      await repository.findByUserIdLight('user-123', 1, 20);

      // Assert
      expect(mockQueryBuilder.andWhere).not.toHaveBeenCalled();
    });
  });

  describe('findOwnedById', () => {
    it('should find envelope owned by user', async () => {
      const id = 'envelope-123';
      mockRepository.findOneBy.mockResolvedValue(mockEnvelope);

      const result = await repository.findOwnedById('user-123', id);

      expect(result).toEqual(mockEnvelope);
      expect(mockRepository.findOneBy).toHaveBeenCalledWith({
        id,
        userId: 'user-123',
      });
    });

    it('should return null if envelope not found or owned by another user', async () => {
      mockRepository.findOneBy.mockResolvedValue(null);

      const result = await repository.findOwnedById('user-123', 'non-existent');

      expect(result).toBeNull();
    });
  });

  describe('create', () => {
    it('should create a new envelope', async () => {
      // Arrange
      const envelopeData = {
        name: 'New Envelope',
        amount: 1000,
        currency: 'COP',
        spent: 0,
        userId: 'user-123',
      };
      mockRepository.create.mockReturnValue(mockEnvelope);
      mockRepository.save.mockResolvedValue(mockEnvelope);

      // Act
      const result = await repository.create(envelopeData);

      // Assert
      expect(result).toEqual(mockEnvelope);
      expect(mockRepository.create).toHaveBeenCalledWith(envelopeData);
      expect(mockRepository.save).toHaveBeenCalledWith(mockEnvelope);
    });
  });
});

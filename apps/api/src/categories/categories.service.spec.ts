import { ConflictException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { QueryFailedError } from 'typeorm';

import { ERROR_MESSAGES } from '@/common/constants/error-messages';
import { CategoriesService } from './categories.service';
import { Category } from './entities/category.entity';
import { CategoriesRepository } from './repositories/categories.repository';

describe('CategoriesService', () => {
  let service: CategoriesService;
  let repository: jest.Mocked<CategoriesRepository>;

  const mockCategory: Category = {
    id: 'cat-1',
    userId: 'user-123',
    label: 'hogar',
    color: 'oklch(0.72 0.14 153)',
    icon: 'house',
    isDefault: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const mockRepo = {
      hasBeenSeeded: jest.fn().mockResolvedValue(true),
      seedDefaultsFor: jest.fn(),
      findAllOwned: jest.fn(),
      countEnvelopesByCategory: jest.fn(),
      findOwnedByLabel: jest.fn(),
      findOwnedById: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CategoriesService,
        { provide: CategoriesRepository, useValue: mockRepo },
      ],
    }).compile();

    service = module.get<CategoriesService>(CategoriesService);
    repository = module.get(CategoriesRepository);
  });

  describe('create', () => {
    it('returns the created category id alongside the message', async () => {
      repository.findOwnedByLabel.mockResolvedValue(null);
      repository.create.mockResolvedValue(mockCategory);

      const result = await service.create('user-123', {
        label: 'hogar',
        color: 'oklch(0.72 0.14 153)',
        icon: 'house',
      });

      expect(result).toEqual({ id: 'cat-1', message: 'Categoría creada' });
    });

    it('maps a concurrent Postgres unique violation (23505) to ConflictException', async () => {
      repository.findOwnedByLabel.mockResolvedValue(null);
      repository.create.mockRejectedValue(
        new QueryFailedError(
          'INSERT',
          [],
          Object.assign(new Error('duplicate'), { code: '23505' }),
        ),
      );

      await expect(
        service.create('user-123', {
          label: 'hogar',
          color: 'oklch(0.72 0.14 153)',
          icon: 'house',
        }),
      ).rejects.toThrow(
        new ConflictException(ERROR_MESSAGES.CATEGORY_ALREADY_EXISTS),
      );
    });
  });

  describe('findAllForUser', () => {
    it('skips hasBeenSeeded when user already owns a seeded default category', async () => {
      const seeded = [{ ...mockCategory, isDefault: true }];
      repository.findAllOwned.mockResolvedValue(seeded);

      const result = await service.findAllForUser('user-123');

      expect(result).toEqual(seeded);
      expect(repository.hasBeenSeeded).not.toHaveBeenCalled();
      expect(repository.seedDefaultsFor).not.toHaveBeenCalled();
    });

    it('checks hasBeenSeeded and skips seeding when user deleted all categories', async () => {
      repository.findAllOwned.mockResolvedValue([]);
      repository.hasBeenSeeded.mockResolvedValue(true);

      const result = await service.findAllForUser('user-123');

      expect(result).toEqual([]);
      expect(repository.hasBeenSeeded).toHaveBeenCalledWith('user-123');
      expect(repository.seedDefaultsFor).not.toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('allows a case-only rename of the same category', async () => {
      repository.findOwnedById.mockResolvedValue(mockCategory);
      repository.findOwnedByLabel.mockResolvedValue(mockCategory);

      const result = await service.update('user-123', 'cat-1', {
        label: 'Hogar',
      });

      expect(result).toEqual({ message: 'Categoría actualizada' });
      expect(repository.update).toHaveBeenCalledWith('cat-1', {
        label: 'Hogar',
      });
    });

    it('rejects renaming to a label already owned by another category', async () => {
      repository.findOwnedById.mockResolvedValue(mockCategory);
      repository.findOwnedByLabel.mockResolvedValue({
        ...mockCategory,
        id: 'cat-2',
        label: 'Viajes',
      });

      await expect(
        service.update('user-123', 'cat-1', { label: 'viajes' }),
      ).rejects.toThrow(
        new ConflictException(ERROR_MESSAGES.CATEGORY_ALREADY_EXISTS),
      );
      expect(repository.update).not.toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('returns a plain message without leaking the raw entity', async () => {
      repository.findOwnedById.mockResolvedValue(mockCategory);
      repository.remove.mockResolvedValue(mockCategory);

      const result = await service.remove('user-123', 'cat-1');

      expect(result).toEqual({ message: 'Categoría eliminada' });
      expect(result).not.toHaveProperty('userId');
    });
  });
});

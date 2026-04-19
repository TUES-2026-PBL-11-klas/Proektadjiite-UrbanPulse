// Integration test: exercises AuthService → UserRepository → (mocked) database path
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AuthService } from '../../src/services/AuthService.js';
import { ConflictError, UnauthorizedError, ValidationError } from '../../src/errors/AppError.js';
import { Prisma } from '@prisma/client';

const makeUserRepo = (overrides = {}) => ({
  findByEmail: vi.fn(),
  findById: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  ...overrides,
});

describe('AuthService integration', () => {
  let service;
  let userRepo;

  beforeEach(() => {
    userRepo = makeUserRepo();
    service = new AuthService(userRepo);
  });

  describe('register', () => {
    it('returns token and user on success', async () => {
      userRepo.create.mockResolvedValue({
        id: 'uuid-1', email: 'a@b.com', display_name: 'Alice',
        role: 'citizen', points: 0, level: 1, created_at: new Date(),
      });

      const result = await service.register('a@b.com', 'password123', 'Alice');

      expect(result).toHaveProperty('token');
      expect(result.user.email).toBe('a@b.com');
      expect(userRepo.create).toHaveBeenCalledOnce();
    });

    it('throws ValidationError when password is too short', async () => {
      await expect(service.register('a@b.com', 'short', 'Alice'))
        .rejects.toBeInstanceOf(ValidationError);
    });

    it('throws ValidationError when required fields are missing', async () => {
      await expect(service.register('', '', ''))
        .rejects.toBeInstanceOf(ValidationError);
    });

    it('throws ConflictError on duplicate email (Prisma P2002)', async () => {
      const prismaError = new Prisma.PrismaClientKnownRequestError('Unique constraint failed', {
        code: 'P2002', clientVersion: '5.0.0',
      });
      userRepo.create.mockRejectedValue(prismaError);

      await expect(service.register('dup@b.com', 'password123', 'Bob'))
        .rejects.toBeInstanceOf(ConflictError);
    });
  });

  describe('login', () => {
    it('throws UnauthorizedError when user does not exist', async () => {
      userRepo.findByEmail.mockResolvedValue(null);

      await expect(service.login('nope@b.com', 'pass1234'))
        .rejects.toBeInstanceOf(UnauthorizedError);
    });

    it('throws UnauthorizedError on wrong password', async () => {
      const bcrypt = await import('bcrypt');
      const hash = await bcrypt.hash('correctpass', 10);

      userRepo.findByEmail.mockResolvedValue({
        id: 'uuid-1', email: 'a@b.com', password_hash: hash,
        display_name: 'Alice', role: 'citizen', points: 0, level: 1, created_at: new Date(),
      });

      await expect(service.login('a@b.com', 'wrongpass'))
        .rejects.toBeInstanceOf(UnauthorizedError);
    });

    it('returns token and user on correct credentials', async () => {
      const bcrypt = await import('bcrypt');
      const hash = await bcrypt.hash('correctpass', 10);

      userRepo.findByEmail.mockResolvedValue({
        id: 'uuid-1', email: 'a@b.com', password_hash: hash,
        display_name: 'Alice', role: 'citizen', points: 0, level: 1, created_at: new Date(),
      });

      const result = await service.login('a@b.com', 'correctpass');

      expect(result).toHaveProperty('token');
      expect(result.user.email).toBe('a@b.com');
    });
  });
});

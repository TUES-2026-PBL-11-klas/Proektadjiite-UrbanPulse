import bcrypt from 'bcrypt';
import { Prisma } from '@prisma/client';
import { UserRepository, userRepository as defaultUserRepo } from '../repositories/UserRepository.js';
import { signToken, toAuthUser } from '../utils/auth.js';
import { ValidationError, NotFoundError, UnauthorizedError, ConflictError } from '../errors/AppError.js';

const SALT_ROUNDS = 10;

export class AuthService {
  constructor(userRepo = defaultUserRepo) {
    this.userRepo = userRepo;
  }

  async register(email, password, displayName) {
    if (!email || !password || !displayName)
      throw new ValidationError('email, password, and display_name are required');
    if (password.length < 8)
      throw new ValidationError('password must be at least 8 characters long');

    try {
      const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
      const user = await this.userRepo.create({ email, password_hash: passwordHash, display_name: displayName });
      const authUser = toAuthUser(user);
      return { token: signToken(authUser), user: authUser };
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002')
        throw new ConflictError('email already registered');
      throw error;
    }
  }

  async login(email, password) {
    if (!email || !password)
      throw new ValidationError('email and password are required');

    const user = await this.userRepo.findByEmail(email);
    if (!user) throw new UnauthorizedError('invalid credentials');

    const passwordMatches = await bcrypt.compare(password, user.password_hash);
    if (!passwordMatches) throw new UnauthorizedError('invalid credentials');

    const authUser = toAuthUser(user);
    return { token: signToken(authUser), user: authUser };
  }

  async updateProfile(userId, { display_name, current_password, new_password }) {
    const user = await this.userRepo.findById(userId);
    if (!user) throw new NotFoundError('user not found');

    const updates = {};

    if (display_name !== undefined) {
      const trimmed = display_name?.trim();
      if (!trimmed) throw new ValidationError('display_name cannot be empty');
      updates.display_name = trimmed;
    }

    if (new_password !== undefined) {
      if (!current_password)
        throw new ValidationError('current_password is required to set a new password');
      const matches = await bcrypt.compare(current_password, user.password_hash);
      if (!matches) throw new UnauthorizedError('current password is incorrect');
      if (new_password.length < 8)
        throw new ValidationError('new password must be at least 8 characters long');
      updates.password_hash = await bcrypt.hash(new_password, SALT_ROUNDS);
    }

    if (Object.keys(updates).length === 0)
      throw new ValidationError('no fields to update');

    const updated = await this.userRepo.update(userId, updates);
    const authUser = toAuthUser(updated);
    return { token: signToken(authUser), user: authUser };
  }
}

export const authService = new AuthService();

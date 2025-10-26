import { PrismaClient, User } from '@prisma/client';
import { BaseRepository } from './base/BaseRepository';

/**
 * User repository implementation using Prisma
 * Handles all user-related database operations
 */
export class UserRepository extends BaseRepository<User> {
  constructor(prisma: PrismaClient) {
    super(prisma, 'user');
  }

  /**
   * Find user by email
   */
  async findByEmail(email: string): Promise<User | null> {
    return this.model.findUnique({
      where: { email: email.toLowerCase() },
    });
  }

  /**
   * Find user by email with password (for authentication)
   */
  async findByEmailWithPassword(email: string): Promise<User | null> {
    return this.model.findUnique({
      where: { email: email.toLowerCase() },
      select: {
        id: true,
        email: true,
        name: true,
        password: true,
        avatar: true,
        timezone: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  /**
   * Find user by ID with password (for password change)
   */
  async findByIdWithPassword(userId: string): Promise<User | null> {
    return this.model.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        password: true,
        avatar: true,
        timezone: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  /**
   * Update user password
   */
  async updatePassword(userId: string, hashedPassword: string): Promise<User> {
    return this.model.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });
  }

  /**
   * Check if email exists
   */
  async emailExists(email: string): Promise<boolean> {
    const count = await this.model.count({
      where: { email: email.toLowerCase() },
    });
    return count > 0;
  }

  /**
   * Get user profile (without password)
   */
  async getUserProfile(userId: string): Promise<Omit<User, 'password'> | null> {
    const user = await this.model.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        timezone: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return user;
  }

  /**
   * Update user profile
   */
  async updateProfile(userId: string, profileData: Partial<User>): Promise<Omit<User, 'password'>> {
    const user = await this.model.update({
      where: { id: userId },
      data: profileData,
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        timezone: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return user;
  }

  /**
   * Create user with profile data only (no password in response)
   */
  async createUser(data: {
    email: string;
    name: string;
    password: string;
    avatar?: string;
    timezone?: string;
  }): Promise<Omit<User, 'password'>> {
    const user = await this.model.create({
      data: {
        email: data.email.toLowerCase(),
        name: data.name,
        password: data.password,
        avatar: data.avatar,
        timezone: data.timezone || 'UTC',
      },
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        timezone: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return user;
  }

  /**
   * Delete user and all related data (cascade delete)
   */
  async deleteUser(userId: string): Promise<void> {
    await this.model.delete({
      where: { id: userId },
    });
  }
}

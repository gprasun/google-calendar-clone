import { hashPassword, comparePassword } from '@/utils/password';
import { createSession } from '@/middleware/sessionAuth';
import { CreateUserRequest, LoginRequest } from '@/types';
import { createError } from '@/middleware/errorHandler';
import { getUserRepository, getCalendarRepository } from '@/repositories/RepositoryFactory';

export class AuthService {
  /**
   * Register a new user
   */
  static async register(userData: CreateUserRequest) {
    const { email, name, password } = userData;

    // Simple password check
    if (password.length < 6) {
      throw createError('Password must be at least 6 characters', 400);
    }

    // Check if user already exists
    const userRepository = getUserRepository();
    const emailExists = await userRepository.emailExists(email);

    if (emailExists) {
      throw createError('User with this email already exists', 409);
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user
    const user = await userRepository.createUser({
      email,
      name,
      password: hashedPassword
    });

    // Create default calendar for the user
    const calendarRepository = getCalendarRepository();
    await calendarRepository.createDefaultCalendar(user.id);

    // Create session
    const sessionId = createSession(user.id, user.email);

    return {
      user,
      sessionId
    };
  }

  /**
   * Login user
   */
  static async login(loginData: LoginRequest) {
    const { email, password } = loginData;

    // Find user by email with password
    const userRepository = getUserRepository();
    const user = await userRepository.findByEmailWithPassword(email);

    if (!user) {
      throw createError('Invalid email or password', 401);
    }

    // Verify password
    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
      throw createError('Invalid email or password', 401);
    }

    // Create session
    const sessionId = createSession(user.id, user.email);

    // Return user data without password
    const { password: _, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword,
      sessionId
    };
  }

  /**
   * Get user profile by ID
   */
  static async getUserProfile(userId: string) {
    const userRepository = getUserRepository();
    const user = await userRepository.getUserProfile(userId);

    if (!user) {
      throw createError('User not found', 404);
    }

    return user;
  }

  /**
   * Update user profile
   */
  static async updateUserProfile(userId: string, updateData: any) {
    const userRepository = getUserRepository();
    const user = await userRepository.updateProfile(userId, updateData);

    return user;
  }

  /**
   * Change user password
   */
  static async changePassword(userId: string, currentPassword: string, newPassword: string) {
    const userRepository = getUserRepository();
    
    // Get user with password
    const userWithPassword = await userRepository.findByIdWithPassword(userId);

    if (!userWithPassword) {
      throw createError('User not found', 404);
    }

    // Verify current password
    const isCurrentPasswordValid = await comparePassword(currentPassword, userWithPassword.password);
    if (!isCurrentPasswordValid) {
      throw createError('Current password is incorrect', 400);
    }

    // Simple password check
    if (newPassword.length < 6) {
      throw createError('Password must be at least 6 characters', 400);
    }

    // Hash new password
    const hashedNewPassword = await hashPassword(newPassword);

    // Update password
    await userRepository.updatePassword(userId, hashedNewPassword);

    return { message: 'Password updated successfully' };
  }

  /**
   * Delete user account
   */
  static async deleteUser(userId: string) {
    const userRepository = getUserRepository();
    
    // Check if user exists
    const user = await userRepository.findById(userId);

    if (!user) {
      throw createError('User not found', 404);
    }

    // Delete user (cascade will handle related records)
    await userRepository.deleteUser(userId);

    return { message: 'User account deleted successfully' };
  }
}

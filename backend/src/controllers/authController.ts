import { Request, Response } from 'express';
import { AuthService } from '@/services/authService';
import { CreateUserRequest, LoginRequest, UpdateUserRequest } from '@/types';
import { asyncHandler } from '@/middleware/errorHandler';
import { AuthenticatedRequest } from '@/types';

export class AuthController {
  /**
   * Register a new user
   * POST /api/auth/register
   */
  static register = asyncHandler(async (req: Request, res: Response) => {
    const userData: CreateUserRequest = req.body;
    
    const result = await AuthService.register(userData);
    
    res.status(201).json({
      success: true,
      data: result,
      message: 'User registered successfully'
    });
  });

  /**
   * Login user
   * POST /api/auth/login
   */
  static login = asyncHandler(async (req: Request, res: Response) => {
    const loginData: LoginRequest = req.body;
    
    const result = await AuthService.login(loginData);
    
    res.status(200).json({
      success: true,
      data: result,
      message: 'Login successful'
    });
  });

  /**
   * Get current user profile
   * GET /api/auth/me
   */
  static getProfile = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user!.id;
    
    const user = await AuthService.getUserProfile(userId);
    
    res.status(200).json({
      success: true,
      data: user,
      message: 'Profile retrieved successfully'
    });
  });

  /**
   * Update user profile
   * PUT /api/auth/profile
   */
  static updateProfile = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user!.id;
    const updateData: UpdateUserRequest = req.body;
    
    const user = await AuthService.updateUserProfile(userId, updateData);
    
    res.status(200).json({
      success: true,
      data: user,
      message: 'Profile updated successfully'
    });
  });

  /**
   * Change user password
   * PUT /api/auth/change-password
   */
  static changePassword = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user!.id;
    const { currentPassword, newPassword } = req.body;
    

    
    const result = await AuthService.changePassword(userId, currentPassword, newPassword);
    
    return res.status(200).json({
      success: true,
      data: result,
      message: 'Password changed successfully'
    });
  });

  /**
   * Delete user account
   * DELETE /api/auth/account
   */
  static deleteAccount = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user!.id;
    
    const result = await AuthService.deleteUser(userId);
    
    res.status(200).json({
      success: true,
      data: result,
      message: 'Account deleted successfully'
    });
  });

  /**
   * Logout user (session cleanup)
   * POST /api/auth/logout
   */
  static logout = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    // Session cleanup handled client-side by removing session ID
    
    res.status(200).json({
      success: true,
      message: 'Logout successful'
    });
  });
}

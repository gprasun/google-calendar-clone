import { CreateCalendarRequest, UpdateCalendarRequest, ShareCalendarRequest, GetCalendarsQuery } from '@/types';
import { createError } from '@/middleware/errorHandler';
import { getCalendarRepository, getUserRepository } from '@/repositories/RepositoryFactory';

export class CalendarService {
  /**
   * Create a new calendar
   */
  static async createCalendar(userId: string, calendarData: CreateCalendarRequest) {
    const { name, description, color, isPublic } = calendarData;
    const calendarRepository = getCalendarRepository();

    const calendar = await calendarRepository.create({
      name,
      description,
      color: color || '#4285f4',
      isPublic: isPublic || false,
      userId
    });

    return calendar;
  }

  /**
   * Get user's calendars
   */
  static async getUserCalendars(userId: string, query: GetCalendarsQuery = {}) {
    const { includeShared } = query;
    const calendarRepository = getCalendarRepository();

    const calendars = await calendarRepository.getUserCalendars(userId, includeShared === 'true');

    return calendars;
  }

  /**
   * Get calendar by ID
   */
  static async getCalendarById(calendarId: string, userId: string) {
    const calendarRepository = getCalendarRepository();
    const calendar = await calendarRepository.getCalendarWithShares(calendarId, userId);

    if (!calendar) {
      throw createError('Calendar not found or access denied', 404);
    }

    return calendar;
  }

  /**
   * Update calendar
   */
  static async updateCalendar(calendarId: string, userId: string, updateData: UpdateCalendarRequest) {
    const calendarRepository = getCalendarRepository();
    const updatedCalendar = await calendarRepository.updateCalendarWithAccess(calendarId, userId, updateData);

    return updatedCalendar;
  }

  /**
   * Delete calendar
   */
  static async deleteCalendar(calendarId: string, userId: string) {
    const calendarRepository = getCalendarRepository();
    await calendarRepository.deleteCalendarWithOwnership(calendarId, userId);

    return { message: 'Calendar deleted successfully' };
  }

  /**
   * Share calendar with another user
   */
  static async shareCalendar(calendarId: string, ownerId: string, shareData: ShareCalendarRequest) {
    const { email, role } = shareData;
    const calendarRepository = getCalendarRepository();
    const userRepository = getUserRepository();

    // Check if user owns the calendar
    const hasAccess = await calendarRepository.hasAccess(calendarId, ownerId, 'owner');
    if (!hasAccess) {
      throw createError('Calendar not found or insufficient permissions', 404);
    }

    // Find the user to share with
    const userToShare = await userRepository.findByEmail(email);
    if (!userToShare) {
      throw createError('User not found', 404);
    }

    // Check if user is trying to share with themselves
    if (userToShare.id === ownerId) {
      throw createError('Cannot share calendar with yourself', 400);
    }

    // Check if calendar is already shared with this user
    const isAlreadyShared = await calendarRepository.isCalendarSharedWith(calendarId, userToShare.id);
    if (isAlreadyShared) {
      throw createError('Calendar is already shared with this user', 409);
    }

    // Create the share
    const share = await calendarRepository.shareCalendar(calendarId, userToShare.id, role);

    return share;
  }

  /**
   * Update calendar share permissions
   */
  static async updateCalendarShare(calendarId: string, shareId: string, ownerId: string, role: string) {
    const calendarRepository = getCalendarRepository();

    // Check if user owns the calendar
    const hasAccess = await calendarRepository.hasAccess(calendarId, ownerId, 'owner');
    if (!hasAccess) {
      throw createError('Calendar not found or insufficient permissions', 404);
    }

    const updatedShare = await calendarRepository.updateCalendarShare(shareId, role as 'viewer' | 'editor');

    return updatedShare;
  }

  /**
   * Remove calendar share
   */
  static async removeCalendarShare(calendarId: string, shareId: string, ownerId: string) {
    const calendarRepository = getCalendarRepository();

    // Check if user owns the calendar
    const hasAccess = await calendarRepository.hasAccess(calendarId, ownerId, 'owner');
    if (!hasAccess) {
      throw createError('Calendar not found or insufficient permissions', 404);
    }

    await calendarRepository.removeCalendarShare(shareId);

    return { message: 'Calendar share removed successfully' };
  }

  /**
   * Get calendar shares
   */
  static async getCalendarShares(calendarId: string, userId: string) {
    const calendarRepository = getCalendarRepository();

    // Check if user has access to the calendar
    const hasAccess = await calendarRepository.hasAccess(calendarId, userId);
    if (!hasAccess) {
      throw createError('Calendar not found or access denied', 404);
    }

    const shares = await calendarRepository.getCalendarShares(calendarId);

    return shares;
  }
}

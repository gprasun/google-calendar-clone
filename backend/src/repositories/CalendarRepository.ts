import { PrismaClient, Calendar, CalendarShare } from '@prisma/client';
import { BaseRepository } from './base/BaseRepository';

/**
 * Calendar repository implementation using Prisma
 * Handles all calendar-related database operations
 */
export class CalendarRepository extends BaseRepository<Calendar> {
  constructor(prisma: PrismaClient) {
    super(prisma, 'calendar');
  }

  /**
   * Get user's calendars (own + shared)
   */
  async getUserCalendars(userId: string, includeShared: boolean = false): Promise<Calendar[]> {
    const whereClause: any = {
      OR: [
        { userId }, // User's own calendars
        ...(includeShared ? [{
          shares: {
            some: { userId }
          }
        }] : [])
      ]
    };

    return this.model.findMany({
      where: whereClause,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        shares: includeShared ? {
          where: { userId },
          select: {
            role: true,
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        } : false,
        _count: {
          select: {
            events: true
          }
        }
      },
      orderBy: [
        { isDefault: 'desc' },
        { createdAt: 'asc' }
      ]
    });
  }

  /**
   * Get calendar with sharing information
   */
  async getCalendarWithShares(calendarId: string, userId: string): Promise<Calendar | null> {
    return this.model.findFirst({
      where: {
        id: calendarId,
        OR: [
          { userId }, // User owns the calendar
          {
            shares: {
              some: { userId }
            }
          }
        ]
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        shares: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        },
        _count: {
          select: {
            events: true
          }
        }
      }
    });
  }

  /**
   * Check if user has access to calendar
   */
  async hasAccess(calendarId: string, userId: string, requiredRole?: 'viewer' | 'editor' | 'owner'): Promise<boolean> {
    const calendar = await this.model.findFirst({
      where: {
        id: calendarId,
        OR: [
          { userId }, // User owns the calendar (owner access)
          {
            shares: {
              some: {
                userId,
                ...(requiredRole && requiredRole !== 'owner' ? {
                  role: requiredRole === 'editor' ? { in: ['editor', 'owner'] } : 'viewer'
                } : {})
              }
            }
          }
        ]
      }
    });

    return !!calendar;
  }

  /**
   * Get calendar shares
   */
  async getCalendarShares(calendarId: string): Promise<CalendarShare[]> {
    return this.prisma.calendarShare.findMany({
      where: { calendarId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: { createdAt: 'asc' }
    });
  }

  /**
   * Share calendar with user
   */
  async shareCalendar(calendarId: string, userId: string, role: 'viewer' | 'editor'): Promise<CalendarShare> {
    return this.prisma.calendarShare.create({
      data: {
        calendarId,
        userId,
        role
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        calendar: {
          select: {
            id: true,
            name: true,
            color: true
          }
        }
      }
    });
  }

  /**
   * Update calendar share
   */
  async updateCalendarShare(shareId: string, role: 'viewer' | 'editor'): Promise<CalendarShare> {
    return this.prisma.calendarShare.update({
      where: { id: shareId },
      data: { role },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });
  }

  /**
   * Remove calendar share
   */
  async removeCalendarShare(shareId: string): Promise<void> {
    await this.prisma.calendarShare.delete({
      where: { id: shareId }
    });
  }

  /**
   * Check if calendar is already shared with user
   */
  async isCalendarSharedWith(calendarId: string, userId: string): Promise<boolean> {
    const share = await this.prisma.calendarShare.findUnique({
      where: {
        calendarId_userId: {
          calendarId,
          userId
        }
      }
    });

    return !!share;
  }

  /**
   * Get user's default calendar
   */
  async getDefaultCalendar(userId: string): Promise<Calendar | null> {
    return this.model.findFirst({
      where: {
        userId,
        isDefault: true
      }
    });
  }

  /**
   * Create default calendar for user
   */
  async createDefaultCalendar(userId: string): Promise<Calendar> {
    return this.model.create({
      data: {
        name: 'My Calendar',
        description: 'Default calendar',
        color: '#4285f4',
        isDefault: true,
        userId
      }
    });
  }

  /**
   * Update calendar with access check
   */
  async updateCalendarWithAccess(
    calendarId: string,
    userId: string,
    data: Partial<Calendar>
  ): Promise<Calendar> {
    // Check if user has edit access
    const hasAccess = await this.hasAccess(calendarId, userId, 'editor');
    if (!hasAccess) {
      throw new Error('Insufficient permissions to update calendar');
    }

    return this.model.update({
      where: { id: calendarId },
      data,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        _count: {
          select: {
            events: true
          }
        }
      }
    });
  }

  /**
   * Delete calendar with ownership check
   */
  async deleteCalendarWithOwnership(calendarId: string, userId: string): Promise<void> {
    // Check if user owns the calendar
    const calendar = await this.model.findFirst({
      where: {
        id: calendarId,
        userId
      }
    });

    if (!calendar) {
      throw new Error('Calendar not found or insufficient permissions');
    }

    if (calendar.isDefault) {
      throw new Error('Cannot delete default calendar');
    }

    await this.model.delete({
      where: { id: calendarId }
    });
  }
}

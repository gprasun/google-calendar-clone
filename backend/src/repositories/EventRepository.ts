import { PrismaClient, Event, EventParticipant } from '@prisma/client';
import { BaseRepository } from './base/BaseRepository';
import { generateRecurringInstances } from '../utils/recurrence';

export interface EventFilters {
  startDate?: Date;
  endDate?: Date;
  calendarId?: string;
  isRecurring?: boolean;
  isAllDay?: boolean;
}

export interface EventQueryOptions {
  limit?: number;
  offset?: number;
  orderBy?: string;
  orderDirection?: 'asc' | 'desc';
  includeRelations?: boolean;
}

export interface CreateEventData {
  title: string;
  description?: string;
  startTime: Date;
  endTime: Date;
  isAllDay: boolean;
  location?: string;
  color: string;
  calendarId: string;
  userId: string;
  isRecurring: boolean;
  recurrenceRule?: string;
}

export interface EventParticipantData {
  email: string;
  name?: string;
  userId?: string; // For registered users
}

/**
 * Event repository implementation using Prisma
 * Handles all event-related database operations
 */
export class EventRepository extends BaseRepository<Event> {
  constructor(prisma: PrismaClient) {
    super(prisma, 'event');
  }

  private async getUserEmail(userId: string): Promise<string> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { email: true }
    });
    return user?.email || '';
  }

  /**
   * Get events for user with filtering
   */
  async getUserEvents(
    userId: string,
    filters?: EventFilters,
    options?: EventQueryOptions
  ): Promise<{ data: Event[]; total: number; limit: number; offset: number; hasMore: boolean }> {
    const whereClause: any = {
      OR: [
        { userId }, // User's own events
        {
          calendar: {
            shares: {
              some: { userId }
            }
          }
        },
        {
          participants: {
            some: { userId }
          }
        }
      ]
    };

    // Apply filters
    if (filters) {
      if (filters.startDate || filters.endDate) {
        whereClause.AND = [];
        
        // For overlapping events: event overlaps with date range if:
        // event.startTime <= range.endDate AND event.endTime >= range.startDate
        if (filters.startDate && filters.endDate) {
          whereClause.AND.push({
            startTime: { lte: filters.endDate }
          });
          whereClause.AND.push({
            endTime: { gte: filters.startDate }
          });
        } else if (filters.startDate) {
          whereClause.AND.push({
            endTime: { gte: filters.startDate }
          });
        } else if (filters.endDate) {
          whereClause.AND.push({
            startTime: { lte: filters.endDate }
          });
        }
      }

      if (filters.calendarId) {
        whereClause.calendarId = filters.calendarId;
      }

      if (filters.isRecurring !== undefined) {
        whereClause.isRecurring = filters.isRecurring;
      }

      if (filters.isAllDay !== undefined) {
        whereClause.isAllDay = filters.isAllDay;
      }
    }

    const limit = options?.limit || 50;
    const offset = options?.offset || 0;

    const query: any = {
      where: whereClause,
      orderBy: {
        [options?.orderBy || 'startTime']: options?.orderDirection || 'asc'
      },
      take: limit,
      skip: offset
    };

    if (options?.includeRelations) {
      query.include = {
        calendar: {
          select: {
            id: true,
            name: true,
            color: true
          }
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        participants: true
      };
    }

    const [data, total] = await Promise.all([
      this.model.findMany(query),
      this.model.count({ where: whereClause })
    ]);

    return {
      data,
      total,
      limit,
      offset,
      hasMore: offset + data.length < total
    };
  }

  /**
   * Get events in date range
   */
  async getEventsInRange(
    userId: string,
    startDate: Date,
    endDate: Date,
    calendarId?: string
  ): Promise<Event[]> {
    const filters: EventFilters = {
      startDate,
      endDate,
      calendarId
    };

    const result = await this.getUserEvents(userId, filters, {
      includeRelations: true,
      orderBy: 'startTime',
      orderDirection: 'asc'
    });

    return result.data;
  }

  /**
   * Get today's events
   */
  async getTodaysEvents(userId: string): Promise<Event[]> {
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

    return this.getEventsInRange(userId, startOfDay, endOfDay);
  }

  /**
   * Get upcoming events
   */
  async getUpcomingEvents(userId: string, limit: number = 10): Promise<Event[]> {
    const now = new Date();
    
    const result = await this.getUserEvents(userId, {
      startDate: now
    }, {
      limit,
      includeRelations: true,
      orderBy: 'startTime',
      orderDirection: 'asc'
    });

    return result.data;
  }

  /**
   * Get event with all relations
   */
  async getEventWithRelations(eventId: string, userId: string): Promise<Event | null> {
    return this.model.findFirst({
      where: {
        id: eventId,
        OR: [
          { userId }, // User owns the event
          {
            calendar: {
              shares: {
                some: { userId }
              }
            }
          },
          {
            participants: {
              some: { userId }
            }
          }
        ]
      },
      include: {
        calendar: {
          select: {
            id: true,
            name: true,
            color: true
          }
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        participants: true
      }
    });
  }

  /**
   * Check if user has access to event
   */
  async hasEventAccess(eventId: string, userId: string, requiredRole?: 'viewer' | 'editor' | 'owner'): Promise<boolean> {
    const event = await this.model.findFirst({
      where: {
        id: eventId,
        OR: [
          { userId }, // User owns the event (owner access)
          {
            calendar: {
              shares: {
                some: {
                  userId,
                  ...(requiredRole && requiredRole !== 'owner' ? {
                    role: requiredRole === 'editor' ? { in: ['editor', 'owner'] } : 'viewer'
                  } : {})
                }
              }
            }
          },
          {
            participants: {
              some: { userId }
            }
          }
        ]
      }
    });

    return !!event;
  }

  /**
   * Create event with participants
   */
  async createEventWithRelations(
    eventData: CreateEventData,
    participants?: EventParticipantData[]
  ): Promise<Event> {
    return this.executeTransaction(async () => {
      // Create the event
      const event = await this.prisma.event.create({
        data: eventData,
        include: {
          calendar: {
            select: {
              id: true,
              name: true,
              color: true
            }
          },
          user: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          participants: true
        }
      });

      // Create participants if provided
      if (participants && participants.length > 0) {
        const participantData = await Promise.all(
          participants.map(async (participant) => {
            // Try to find user by email if userId not provided
            let userId = participant.userId;
            if (!userId) {
              const user = await this.prisma.user.findUnique({
                where: { email: participant.email },
                select: { id: true }
              });
              userId = user?.id;
            }
            
            return {
              eventId: event.id,
              userId,
              email: participant.email,
              name: participant.name
            };
          })
        );
        
        await this.prisma.eventParticipant.createMany({
          data: participantData
        });
      }

      // If it's a recurring event, generate instances
      if (eventData.isRecurring && eventData.recurrenceRule) {
        await this.generateRecurringInstances(
          event.id,
          eventData.startTime,
          eventData.endTime,
          eventData.recurrenceRule
        );
      }

      // Return the complete event
      return this.prisma.event.findUnique({
        where: { id: event.id },
        include: {
          calendar: {
            select: {
              id: true,
              name: true,
              color: true
            }
          },
          user: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          participants: true
        }
      }) as Promise<Event>;
    });
  }

  /**
   * Update event with relations
   */
  async updateEventWithRelations(
    eventId: string,
    eventData: Partial<Event>,
    participants?: EventParticipantData[]
  ): Promise<Event> {
    return this.executeTransaction(async () => {
      // Update the event
      const event = await this.prisma.event.update({
        where: { id: eventId },
        data: eventData
      });

      // Update participants if provided
      if (participants !== undefined) {
        // Delete existing participants
        await this.prisma.eventParticipant.deleteMany({
          where: { eventId }
        });

        // Create new participants
        if (participants.length > 0) {
          const participantData = await Promise.all(
            participants.map(async (participant) => {
              let userId = participant.userId;
              if (!userId) {
                const user = await this.prisma.user.findUnique({
                  where: { email: participant.email },
                  select: { id: true }
                });
                userId = user?.id;
              }
              
              return {
                eventId,
                userId,
                email: participant.email,
                name: participant.name
              };
            })
          );
          
          await this.prisma.eventParticipant.createMany({
            data: participantData
          });
        }
      }

      // Return the complete updated event
      return this.prisma.event.findUnique({
        where: { id: eventId },
        include: {
          calendar: {
            select: {
              id: true,
              name: true,
              color: true
            }
          },
          user: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          participants: true
        }
      }) as Promise<Event>;
    });
  }

  /**
   * Get event participants
   */
  async getEventParticipants(eventId: string): Promise<EventParticipant[]> {
    return this.prisma.eventParticipant.findMany({
      where: { eventId },
      orderBy: { createdAt: 'asc' }
    });
  }

  /**
   * Update participant status
   */
  async updateParticipantStatus(
    participantId: string,
    status: 'pending' | 'accepted' | 'declined' | 'tentative'
  ): Promise<EventParticipant> {
    return this.prisma.eventParticipant.update({
      where: { id: participantId },
      data: { status },
      include: {
        event: {
          select: {
            id: true,
            title: true,
            startTime: true,
            endTime: true
          }
        }
      }
    });
  }

  /**
   * Generate recurring event instances
   */
  async generateRecurringInstances(
    parentEventId: string,
    startDate: Date,
    endDate: Date,
    recurrenceRule: string
  ): Promise<void> {
    // Limit to 30 instances to prevent database bloat
    const instances = generateRecurringInstances(startDate, endDate, recurrenceRule, 30);

    // Get parent event details
    const parentEvent = await this.model.findUnique({
      where: { id: parentEventId },
      select: { calendarId: true, userId: true, title: true, description: true, color: true, isAllDay: true }
    });

    if (parentEvent && instances.length > 0) {
      const instanceData = instances.slice(1).map(instance => ({ // Skip first instance (original event)
        title: parentEvent.title,
        description: parentEvent.description,
        startTime: instance.startDate,
        endTime: instance.endDate,
        isAllDay: parentEvent.isAllDay,
        color: parentEvent.color,
        calendarId: parentEvent.calendarId,
        userId: parentEvent.userId,
        isRecurring: false,
        parentEventId,
        originalEventId: parentEventId
      }));

      if (instanceData.length > 0) {
        await this.model.createMany({
          data: instanceData
        });
      }
    }
  }

  /**
   * Delete event with access check
   */
  async deleteEventWithAccess(eventId: string, userId: string): Promise<void> {
    const hasAccess = await this.hasEventAccess(eventId, userId, 'editor');
    if (!hasAccess) {
      throw new Error('Insufficient permissions to delete event');
    }

    await this.model.delete({
      where: { id: eventId }
    });
  }
}
import { CreateEventRequest, UpdateEventRequest, GetEventsQuery } from '@/types';
import { createError } from '@/middleware/errorHandler';
import { getEventRepository, getCalendarRepository } from '@/repositories/RepositoryFactory';

export class EventService {
  /**
   * Create a new event
   */
  static async createEvent(userId: string, eventData: CreateEventRequest) {
    const {
      title,
      description,
      location,
      startTime,
      endTime,
      isAllDay,
      color,
      calendarId,
      isRecurring,
      recurrenceRule,
      participants
    } = eventData;

    const eventRepository = getEventRepository();
    const calendarRepository = getCalendarRepository();

    // Verify user has access to the calendar
    const hasAccess = await calendarRepository.hasAccess(calendarId, userId, 'editor');
    if (!hasAccess) {
      throw createError('Calendar not found or insufficient permissions', 404);
    }

    // Create the event with relations
    const event = await eventRepository.createEventWithRelations(
      {
        title,
        description,
        location,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        isAllDay: isAllDay || false,
        color: color || '#4285f4',
        calendarId,
        userId,
        isRecurring: isRecurring || false,
        recurrenceRule: isRecurring ? recurrenceRule : undefined
      },
      participants
    );

    return event;
  }

  /**
   * Get events for a user
   */
  static async getEvents(userId: string, query: GetEventsQuery = {}) {
    const {
      startDate,
      endDate,
      calendarId,
      limit = 50,
      offset = 0
    } = query;

    const eventRepository = getEventRepository();

    const filters = {
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      calendarId
    };

    const options = {
      limit: parseInt(limit.toString()),
      offset: parseInt(offset.toString()),
      includeRelations: true,
      orderBy: 'startTime' as const,
      orderDirection: 'asc' as const
    };

    const result = await eventRepository.getUserEvents(userId, filters, options);

    return {
      events: result.data,
      pagination: {
        total: result.total,
        limit: result.limit,
        offset: result.offset,
        hasMore: result.hasMore
      }
    };
  }

  /**
   * Get event by ID
   */
  static async getEventById(eventId: string, userId: string) {
    const eventRepository = getEventRepository();
    const event = await eventRepository.getEventWithRelations(eventId, userId);

    if (!event) {
      throw createError('Event not found or access denied', 404);
    }

    return event;
  }

  /**
   * Update event
   */
  static async updateEvent(eventId: string, userId: string, updateData: UpdateEventRequest) {
    const eventRepository = getEventRepository();

    // Check if user has permission to update the event
    const hasAccess = await eventRepository.hasEventAccess(eventId, userId, 'editor');
    if (!hasAccess) {
      throw createError('Event not found or insufficient permissions', 404);
    }

    // Prepare update data
    const eventUpdateData: any = {};
    
    if (updateData.title !== undefined) eventUpdateData.title = updateData.title;
    if (updateData.description !== undefined) eventUpdateData.description = updateData.description;
    if (updateData.location !== undefined) eventUpdateData.location = updateData.location;
    if (updateData.startTime !== undefined) eventUpdateData.startTime = new Date(updateData.startTime);
    if (updateData.endTime !== undefined) eventUpdateData.endTime = new Date(updateData.endTime);
    if (updateData.isAllDay !== undefined) eventUpdateData.isAllDay = updateData.isAllDay;
    if (updateData.color !== undefined) eventUpdateData.color = updateData.color;
    if (updateData.calendarId !== undefined) eventUpdateData.calendarId = updateData.calendarId;
    if (updateData.isRecurring !== undefined) eventUpdateData.isRecurring = updateData.isRecurring;
    if (updateData.recurrenceRule !== undefined) eventUpdateData.recurrenceRule = updateData.recurrenceRule;

    // Update the event with relations
    const updatedEvent = await eventRepository.updateEventWithRelations(
      eventId,
      eventUpdateData,
      updateData.participants
    );

    return updatedEvent;
  }

  /**
   * Delete event
   */
  static async deleteEvent(eventId: string, userId: string) {
    const eventRepository = getEventRepository();
    await eventRepository.deleteEventWithAccess(eventId, userId);

    return { message: 'Event deleted successfully' };
  }

  /**
   * Update event participant status
   */
  static async updateParticipantStatus(
    eventId: string,
    participantId: string,
    status: 'pending' | 'accepted' | 'declined' | 'tentative',
    userId: string
  ) {
    const eventRepository = getEventRepository();

    // Check if user has access to the event
    const hasAccess = await eventRepository.hasEventAccess(eventId, userId);
    if (!hasAccess) {
      throw createError('Event not found or access denied', 404);
    }

    const participant = await eventRepository.updateParticipantStatus(participantId, status);

    return participant;
  }
}

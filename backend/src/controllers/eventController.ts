import { Request, Response } from 'express';
import { EventService } from '@/services/eventService';
import { CreateEventRequest, UpdateEventRequest, GetEventsQuery } from '@/types';
import { asyncHandler } from '@/middleware/errorHandler';
import { AuthenticatedRequest } from '@/types';

export class EventController {
  /**
   * Create a new event
   * POST /api/events
   */
  static createEvent = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user!.id;
    const eventData: CreateEventRequest = req.body;
    
    const event = await EventService.createEvent(userId, eventData);
    
    res.status(201).json({
      success: true,
      data: event,
      message: 'Event created successfully'
    });
  });

  /**
   * Get events
   * GET /api/events
   */
  static getEvents = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user!.id;
    const query: GetEventsQuery = req.query;
    
    const result = await EventService.getEvents(userId, query);
    
    res.status(200).json({
      success: true,
      data: result.events,
      pagination: result.pagination,
      message: 'Events retrieved successfully'
    });
  });

  /**
   * Get event by ID
   * GET /api/events/:id
   */
  static getEvent = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user!.id;
    const eventId = req.params.id;
    
    const event = await EventService.getEventById(eventId, userId);
    
    res.status(200).json({
      success: true,
      data: event,
      message: 'Event retrieved successfully'
    });
  });

  /**
   * Update event
   * PUT /api/events/:id
   */
  static updateEvent = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user!.id;
    const eventId = req.params.id;
    const updateData: UpdateEventRequest = req.body;
    
    const event = await EventService.updateEvent(eventId, userId, updateData);
    
    res.status(200).json({
      success: true,
      data: event,
      message: 'Event updated successfully'
    });
  });

  /**
   * Delete event
   * DELETE /api/events/:id
   */
  static deleteEvent = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user!.id;
    const eventId = req.params.id;
    
    const result = await EventService.deleteEvent(eventId, userId);
    
    res.status(200).json({
      success: true,
      data: result,
      message: 'Event deleted successfully'
    });
  });

  /**
   * Update event participant status
   * PUT /api/events/:id/participants/:participantId
   */
  static updateParticipantStatus = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user!.id;
    const eventId = req.params.id;
    const participantId = req.params.participantId;
    const { status } = req.body;
    

    
    const participant = await EventService.updateParticipantStatus(
      eventId,
      participantId,
      status as 'pending' | 'accepted' | 'declined' | 'tentative',
      userId
    );
    
    return res.status(200).json({
      success: true,
      data: participant,
      message: 'Participant status updated successfully'
    });
  });

  /**
   * Get events for a specific date range (for calendar views)
   * GET /api/events/range
   */
  static getEventsInRange = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user!.id;
    const { startDate, endDate, calendarId } = req.query;
    

    
    const query: GetEventsQuery = {
      startDate: startDate as string,
      endDate: endDate as string,
      calendarId: calendarId as string
    };
    
    const result = await EventService.getEvents(userId, query);
    
    return res.status(200).json({
      success: true,
      data: result.events,
      message: 'Events retrieved successfully'
    });
  });

  /**
   * Get today's events
   * GET /api/events/today
   */
  static getTodaysEvents = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user!.id;
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
    
    const query: GetEventsQuery = {
      startDate: startOfDay.toISOString(),
      endDate: endOfDay.toISOString()
    };
    
    const result = await EventService.getEvents(userId, query);
    
    res.status(200).json({
      success: true,
      data: result.events,
      message: 'Today\'s events retrieved successfully'
    });
  });

  /**
   * Get upcoming events
   * GET /api/events/upcoming
   */
  static getUpcomingEvents = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user!.id;
    const { limit = 10 } = req.query;
    const now = new Date();
    
    const query: GetEventsQuery = {
      startDate: now.toISOString(),
      limit: limit as string
    };
    
    const result = await EventService.getEvents(userId, query);
    
    return res.status(200).json({
      success: true,
      data: result.events,
      message: 'Upcoming events retrieved successfully'
    });
  });
}

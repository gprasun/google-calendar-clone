import { Request, Response } from 'express';
import { CalendarService } from '@/services/calendarService';
import { CreateCalendarRequest, UpdateCalendarRequest, ShareCalendarRequest, GetCalendarsQuery } from '@/types';
import { asyncHandler } from '@/middleware/errorHandler';
import { AuthenticatedRequest } from '@/types';

export class CalendarController {
  /**
   * Create a new calendar
   * POST /api/calendars
   */
  static createCalendar = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user!.id;
    const calendarData: CreateCalendarRequest = req.body;
    
    const calendar = await CalendarService.createCalendar(userId, calendarData);
    
    res.status(201).json({
      success: true,
      data: calendar,
      message: 'Calendar created successfully'
    });
  });

  /**
   * Get user's calendars
   * GET /api/calendars
   */
  static getCalendars = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user!.id;
    const query: GetCalendarsQuery = req.query;
    
    const calendars = await CalendarService.getUserCalendars(userId, query);
    
    res.status(200).json({
      success: true,
      data: calendars,
      message: 'Calendars retrieved successfully'
    });
  });

  /**
   * Get calendar by ID
   * GET /api/calendars/:id
   */
  static getCalendar = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user!.id;
    const calendarId = req.params.id;
    
    const calendar = await CalendarService.getCalendarById(calendarId, userId);
    
    res.status(200).json({
      success: true,
      data: calendar,
      message: 'Calendar retrieved successfully'
    });
  });

  /**
   * Update calendar
   * PUT /api/calendars/:id
   */
  static updateCalendar = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user!.id;
    const calendarId = req.params.id;
    const updateData: UpdateCalendarRequest = req.body;
    
    const calendar = await CalendarService.updateCalendar(calendarId, userId, updateData);
    
    res.status(200).json({
      success: true,
      data: calendar,
      message: 'Calendar updated successfully'
    });
  });

  /**
   * Delete calendar
   * DELETE /api/calendars/:id
   */
  static deleteCalendar = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user!.id;
    const calendarId = req.params.id;
    
    const result = await CalendarService.deleteCalendar(calendarId, userId);
    
    res.status(200).json({
      success: true,
      data: result,
      message: 'Calendar deleted successfully'
    });
  });

  /**
   * Share calendar with another user
   * POST /api/calendars/:id/share
   */
  static shareCalendar = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user!.id;
    const calendarId = req.params.id;
    const shareData: ShareCalendarRequest = req.body;
    
    const share = await CalendarService.shareCalendar(calendarId, userId, shareData);
    
    res.status(201).json({
      success: true,
      data: share,
      message: 'Calendar shared successfully'
    });
  });

  /**
   * Get calendar shares
   * GET /api/calendars/:id/shares
   */
  static getCalendarShares = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user!.id;
    const calendarId = req.params.id;
    
    const shares = await CalendarService.getCalendarShares(calendarId, userId);
    
    res.status(200).json({
      success: true,
      data: shares,
      message: 'Calendar shares retrieved successfully'
    });
  });

  /**
   * Update calendar share permissions
   * PUT /api/calendars/:id/shares/:shareId
   */
  static updateCalendarShare = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user!.id;
    const calendarId = req.params.id;
    const shareId = req.params.shareId;
    const { role } = req.body;
    

    
    const share = await CalendarService.updateCalendarShare(calendarId, shareId, userId, role);
    
    return res.status(200).json({
      success: true,
      data: share,
      message: 'Calendar share updated successfully'
    });
  });

  /**
   * Remove calendar share
   * DELETE /api/calendars/:id/shares/:shareId
   */
  static removeCalendarShare = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user!.id;
    const calendarId = req.params.id;
    const shareId = req.params.shareId;
    
    const result = await CalendarService.removeCalendarShare(calendarId, shareId, userId);
    
    res.status(200).json({
      success: true,
      data: result,
      message: 'Calendar share removed successfully'
    });
  });
}

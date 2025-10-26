import { Router } from 'express';
import { CalendarController } from '@/controllers/calendarController';
import { authenticateSession } from '@/middleware/sessionAuth';

const router = Router();

// All calendar routes require authentication
router.use(authenticateSession);

// Calendar CRUD routes
router.post('/', CalendarController.createCalendar);
router.get('/', CalendarController.getCalendars);
router.get('/:id', CalendarController.getCalendar);
router.put('/:id', CalendarController.updateCalendar);
router.delete('/:id', CalendarController.deleteCalendar);

// Calendar sharing routes
router.post('/:id/share', CalendarController.shareCalendar);
router.get('/:id/shares', CalendarController.getCalendarShares);
router.put('/:id/shares/:shareId', CalendarController.updateCalendarShare);
router.delete('/:id/shares/:shareId', CalendarController.removeCalendarShare);

export default router;

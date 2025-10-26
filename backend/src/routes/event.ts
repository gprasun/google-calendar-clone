import { Router } from 'express';
import { EventController } from '@/controllers/eventController';
import { authenticateSession } from '@/middleware/sessionAuth';

const router = Router();

// All event routes require authentication
router.use(authenticateSession);

// Event CRUD routes
router.post('/', EventController.createEvent);
router.get('/', EventController.getEvents);
router.get('/range', EventController.getEventsInRange);
router.get('/today', EventController.getTodaysEvents);
router.get('/upcoming', EventController.getUpcomingEvents);
router.get('/:id', EventController.getEvent);
router.put('/:id', EventController.updateEvent);
router.delete('/:id', EventController.deleteEvent);

// Event participant routes
router.put('/:id/participants/:participantId', EventController.updateParticipantStatus);

export default router;

import { Request, Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '@/types';

// Simple in-memory session store
const sessions = new Map<string, { userId: string; email: string; createdAt: Date }>();

export const createSession = (userId: string, email: string): string => {
  const sessionId = Math.random().toString(36).substring(2, 15);
  sessions.set(sessionId, { userId, email, createdAt: new Date() });
  return sessionId;
};

export const getSession = (sessionId: string) => {
  return sessions.get(sessionId);
};

export const destroySession = (sessionId: string) => {
  sessions.delete(sessionId);
};

export const authenticateSession = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  const sessionId = req.headers['x-session-id'] as string;
  
  if (!sessionId) {
    res.status(401).json({ success: false, error: 'Session ID required' });
    return;
  }

  const session = getSession(sessionId);
  if (!session) {
    res.status(401).json({ success: false, error: 'Invalid session' });
    return;
  }

  req.user = { id: session.userId, email: session.email } as any;
  next();
};
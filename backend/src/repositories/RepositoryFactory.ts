import { PrismaClient } from '@prisma/client';
import { UserRepository } from './UserRepository';
import { CalendarRepository } from './CalendarRepository';
import { EventRepository } from './EventRepository';

/**
 * Database connection interface for abstraction
 */
export interface IDatabaseConnection {
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  healthCheck(): Promise<boolean>;
}

/**
 * Repository factory that creates and manages repository instances
 * This allows for easy switching between different ORMs or database implementations
 */
export class RepositoryFactory implements IDatabaseConnection {
  private static instance: RepositoryFactory;
  private prisma: PrismaClient;
  private userRepository!: UserRepository;
  private calendarRepository!: CalendarRepository;
  private eventRepository!: EventRepository;

  private constructor() {
    this.prisma = new PrismaClient();
    this.initializeRepositories();
  }

  /**
   * Get singleton instance of RepositoryFactory
   */
  public static getInstance(): RepositoryFactory {
    if (!RepositoryFactory.instance) {
      RepositoryFactory.instance = new RepositoryFactory();
    }
    return RepositoryFactory.instance;
  }

  /**
   * Initialize all repositories
   */
  private initializeRepositories(): void {
    this.userRepository = new UserRepository(this.prisma);
    this.calendarRepository = new CalendarRepository(this.prisma);
    this.eventRepository = new EventRepository(this.prisma);
  }

  /**
   * Get user repository
   */
  public getUserRepository(): UserRepository {
    return this.userRepository;
  }

  /**
   * Get calendar repository
   */
  public getCalendarRepository(): CalendarRepository {
    return this.calendarRepository;
  }

  /**
   * Get event repository
   */
  public getEventRepository(): EventRepository {
    return this.eventRepository;
  }

  /**
   * Get Prisma client (for complex queries if needed)
   */
  public getPrismaClient(): PrismaClient {
    return this.prisma;
  }

  /**
   * Connect to database
   */
  public async connect(): Promise<void> {
    await this.prisma.$connect();
  }

  /**
   * Close database connection
   */
  public async disconnect(): Promise<void> {
    await this.prisma.$disconnect();
  }

  /**
   * Health check for database connection
   */
  public async healthCheck(): Promise<boolean> {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return true;
    } catch (error) {
      console.error('Database health check failed:', error);
      return false;
    }
  }
}

/**
 * Convenience function to get repository factory instance
 */
export const getRepositoryFactory = (): RepositoryFactory => {
  return RepositoryFactory.getInstance();
};

/**
 * Convenience functions to get specific repositories
 */
export const getUserRepository = (): UserRepository => {
  return getRepositoryFactory().getUserRepository();
};

export const getCalendarRepository = (): CalendarRepository => {
  return getRepositoryFactory().getCalendarRepository();
};

export const getEventRepository = (): EventRepository => {
  return getRepositoryFactory().getEventRepository();
};

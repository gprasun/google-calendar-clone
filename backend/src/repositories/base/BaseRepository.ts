import { PrismaClient } from '@prisma/client';

export interface IRepository<T> {
  findById(id: string): Promise<T | null>;
  create(data: any): Promise<T>;
  update(id: string, data: any): Promise<T>;
  delete(id: string): Promise<void>;
  findMany(options?: any): Promise<T[]>;
}

export abstract class BaseRepository<T> implements IRepository<T> {
  protected prisma: PrismaClient;
  protected model: any;

  constructor(prisma: PrismaClient, modelName: string) {
    this.prisma = prisma;
    this.model = (prisma as any)[modelName];
  }

  async executeTransaction<R>(callback: () => Promise<R>): Promise<R> {
    return this.prisma.$transaction(callback);
  }

  async findById(id: string): Promise<T | null> {
    return this.model.findUnique({ where: { id } });
  }

  async create(data: any): Promise<T> {
    return this.model.create({ data });
  }

  async update(id: string, data: any): Promise<T> {
    return this.model.update({ where: { id }, data });
  }

  async delete(id: string): Promise<void> {
    await this.model.delete({ where: { id } });
  }

  async findMany(options?: any): Promise<T[]> {
    return this.model.findMany(options);
  }
}
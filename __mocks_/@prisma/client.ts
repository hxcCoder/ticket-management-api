// __mocks__/@prisma/client.ts
import { mockDeep, DeepMockProxy } from 'jest-mock-extended';
import { PrismaClient } from '@prisma/client';
import { jest } from '@jest/globals';

export const prismaMock = mockDeep<PrismaClient>();

// Esta es la clave: el mock debe devolver el cliente falso
const mockPrismaClient = jest.fn(() => prismaMock);
export { mockPrismaClient as PrismaClient };
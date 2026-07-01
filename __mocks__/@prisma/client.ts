// __mocks__/@prisma/client.ts
import { mockDeep } from 'jest-mock-extended';
import { PrismaClient } from '@prisma/client';

// Creamos un mock profundo que imita todas las propiedades del PrismaClient real
export const prismaMock = mockDeep<PrismaClient>();

// Exportamos el mock como el cliente por defecto
const PrismaClientMock = jest.fn(() => prismaMock);
export { PrismaClientMock as PrismaClient };
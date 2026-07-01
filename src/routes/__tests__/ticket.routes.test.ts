// ==========================================
// 1. MOCKS DE PRISMA Y AUTENTICACIÓN (ANTES DE IMPORTAR APP)
// ==========================================

import { DeepMockProxy } from 'jest-mock-extended';
import { PrismaClient } from '@prisma/client';

// Mock de Prisma usando jest-mock-extended para mantener consistencia
jest.mock('../../config/prisma', () => {
    const { mockDeep } = require('jest-mock-extended');
    return {
        prisma: mockDeep()
    };
});

// Mock de los middlewares de autenticación
jest.mock('../../middleware/authMiddleware', () => {
    let mockUser: any = { id: 'test-user-id', role: 'CUSTOMER' };
    return {
        __setMockUser: (user: any) => { mockUser = user; },
        isAuth: (req: any, _res: any, next: any) => {
            req.user = mockUser;
            next();
        },
        hasRole: (roles: string[]) => {
            return (req: any, res: any, next: any) => {
                if (!req.user) {
                    return res.status(401).json({ status: 'error', message: 'Unauthorized' });
                }
                if (!roles.includes(req.user.role)) {
                    return res.status(403).json({ status: 'error', message: 'Forbidden' });
                }
                next();
            };
        }
    };
});

// ==========================================
// 2. IMPORTS
// ==========================================

import request from 'supertest';
import app from '../../app';
import { prisma } from '../../config/prisma';

// Obtenemos el mock de Prisma tipado correctamente
const prismaMock = prisma as DeepMockProxy<PrismaClient>;

// Helper para cambiar el usuario en los tests
const setMockUser = (user: { id: string; role: string }) => {
    const authMiddleware = require('../../middleware/authMiddleware');
    authMiddleware.__setMockUser(user);
};

// ==========================================
// 3. TESTS
// ==========================================

describe('Ticket Routes', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        setMockUser({ id: 'test-user-id', role: 'CUSTOMER' });
    });

    describe('POST /api/tickets', () => {
        it('should create a ticket and return 201', async () => {
            const mockTicket = {
                id: 'ticket-1',
                title: 'Integration Test Ticket',
                description: 'Created via supertest',
                status: 'OPEN',
                priority: 'HIGH',
                createdAt: new Date(),
                author: { id: 'test-user-id', name: 'Test User', email: 'test@example.com' }
            };

            prismaMock.ticket.create.mockResolvedValue(mockTicket as any);

            const response = await request(app)
                .post('/api/tickets')
                .send({
                    title: 'Integration Test Ticket',
                    description: 'Created via supertest',
                    priority: 'HIGH'
                });

            expect(response.status).toBe(201);
            expect(response.body.status).toBe('success');
            expect(response.body.data.ticket).toMatchObject({
                id: 'ticket-1',
                title: 'Integration Test Ticket'
            });
            expect(prismaMock.ticket.create).toHaveBeenCalled();
        });

        it('should return 400 if validation fails', async () => {
            const response = await request(app)
                .post('/api/tickets')
                .send({ title: 'short' });

            expect(response.status).toBe(400);
            expect(response.body.message).toBe('Validation failed');
            expect(response.body.errors).toBeDefined();
        });
    });

    describe('GET /api/tickets', () => {
        it('should return only own tickets for CUSTOMER', async () => {
            setMockUser({ id: 'cust-1', role: 'CUSTOMER' });
            const mockTickets = [
                { id: '1', title: 'My Ticket', status: 'OPEN', priority: 'LOW', createdAt: new Date(), author: { name: 'C', email: 'c@c.com' } }
            ];
            prismaMock.ticket.findMany.mockResolvedValue(mockTickets as any);  
            
            const response = await request(app).get('/api/tickets');    
            
            expect(response.status).toBe(200);
            expect(response.body.data.tickets).toHaveLength(1);
            expect(prismaMock.ticket.findMany).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: { authorId: 'cust-1' }
                })
            );
        });

        it('should return all tickets for AGENT', async () => {
            setMockUser({ id: 'agent-1', role: 'AGENT' });
            const mockTickets = [
                { id: '1', title: 'Ticket 1', status: 'OPEN', priority: 'HIGH', createdAt: new Date(), author: { name: 'A', email: 'a@a.com' } },
                { id: '2', title: 'Ticket 2', status: 'CLOSED', priority: 'LOW', createdAt: new Date(), author: { name: 'B', email: 'b@b.com' } }
            ];
            prismaMock.ticket.findMany.mockResolvedValue(mockTickets as any);

            const response = await request(app).get('/api/tickets');

            expect(response.status).toBe(200);
            expect(response.body.data.tickets).toHaveLength(2);
            expect(prismaMock.ticket.findMany).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: {}
                })
            );
        });

        it('should return all tickets for ADMIN', async () => {
            setMockUser({ id: 'admin-1', role: 'ADMIN' });
            prismaMock.ticket.findMany.mockResolvedValue([]);

            const response = await request(app).get('/api/tickets');

            expect(response.status).toBe(200);
            expect(prismaMock.ticket.findMany).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: {}
                })
            );
        });
    });
});
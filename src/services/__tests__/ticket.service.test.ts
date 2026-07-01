import { TicketService } from '../ticket.service';
import { PrismaClient } from '@prisma/client';
import { DeepMockProxy } from 'jest-mock-extended';

// Creamos el mock 
jest.mock('../../config/prisma', () => {
    const { mockDeep } = require('jest-mock-extended');
    return {
        prisma: mockDeep()
    };
});

// Luego importamos el prisma mockeado desde el módulo
import { prisma } from '../../config/prisma';

// Tipamos el mock para tener autocompletado
const prismaMock = prisma as DeepMockProxy<PrismaClient>;

describe('TicketService', () => {
    beforeEach(() => {
    jest.clearAllMocks();
});

describe('createTicket', () => {
    it('should create a ticket successfully', async () => {
        const mockTicket = {
        id: 'ticket-123',
        title: 'Test Ticket',
        description: 'This is a test description',
        status: 'OPEN',
        priority: 'MEDIUM',
        createdAt: new Date(),
        author: { id: 'user-1', name: 'John', email: 'john@example.com' }
    };

    prismaMock.ticket.create.mockResolvedValue(mockTicket as any);

    const result = await TicketService.createTicket({
        title: 'Test Ticket',
        description: 'This is a test description',
        priority: 'MEDIUM',
        authorId: 'user-1'
    });

    expect(prismaMock.ticket.create).toHaveBeenCalledWith({
        data: {
            title: 'Test Ticket',
            description: 'This is a test description',
            priority: 'MEDIUM',
            authorId: 'user-1'
        },
        select: expect.any(Object)
    });
    expect(result).toEqual(mockTicket);
    });
});

describe('getTickets', () => {
    it('should return all tickets for AGENT role', async () => {
        const mockTickets = [
            { id: '1', title: 'Ticket 1', status: 'OPEN', priority: 'HIGH', createdAt: new Date(), author: { name: 'A', email: 'a@a.com' } },
            { id: '2', title: 'Ticket 2', status: 'CLOSED', priority: 'LOW', createdAt: new Date(), author: { name: 'B', email: 'b@b.com' } }
        ];
        prismaMock.ticket.findMany.mockResolvedValue(mockTickets as any);

        const result = await TicketService.getTickets('agent-123', 'AGENT');

        expect(prismaMock.ticket.findMany).toHaveBeenCalledWith({
        where: {},
        orderBy: { createdAt: 'desc' },
        select: expect.any(Object)
        });
        expect(result).toEqual(mockTickets);
    });

    it('should return only own tickets for CUSTOMER role', async () => {
        const userId = 'customer-456';
        const mockTickets = [
        { id: '1', title: 'My Ticket', status: 'OPEN', priority: 'HIGH', createdAt: new Date(), author: { name: 'C', email: 'c@c.com' } }
    ];
    prismaMock.ticket.findMany.mockResolvedValue(mockTickets as any);

    const result = await TicketService.getTickets(userId, 'CUSTOMER');

    expect(prismaMock.ticket.findMany).toHaveBeenCalledWith({
        where: { authorId: userId },
        orderBy: { createdAt: 'desc' },
        select: expect.any(Object)
    });
    expect(result).toEqual(mockTickets);
    });

    it('should return all tickets for ADMIN role (no filter)', async () => {
        prismaMock.ticket.findMany.mockResolvedValue([]);
        await TicketService.getTickets('admin-789', 'ADMIN');
        expect(prismaMock.ticket.findMany).toHaveBeenCalledWith({
        where: {},
        orderBy: { createdAt: 'desc' },
        select: expect.any(Object)
    });
    });
});
});
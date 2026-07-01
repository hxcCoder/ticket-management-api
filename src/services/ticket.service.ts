import { prisma } from '../config/prisma';
import { Role, TicketPriority } from '@prisma/client';

interface CreateTicketDTO {
    title: string;
    description: string;
    priority?: TicketPriority;
    authorId: string;
}

export class TicketService {
    /**
     * Crea un nuevo ticket en el sistema
     */
    static async createTicket(data: CreateTicketDTO) {
        const ticket = await prisma.ticket.create({
            data: {
                title: data.title,
                description: data.description,
                priority: data.priority,
                authorId: data.authorId
            },
            select: {
                id: true,
                title: true,
                status: true,
                priority: true,
                createdAt: true,
                author: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                }
            }
        });
        return ticket;
    }

    static async getTickets(userId: string, userRole: Role) {
        let whereCondition = {};

        if (userRole === 'CUSTOMER') {
            whereCondition = { authorId: userId };
        }

        const tickets = await prisma.ticket.findMany({
            where: whereCondition,
            orderBy: {
                createdAt: 'desc',
            },
            select: {
                id: true,
                title: true,
                status: true,
                priority: true,
                createdAt: true,
                author: {
                    select: { name: true, email: true }
                }
            }
        });

        return tickets;
    }
}
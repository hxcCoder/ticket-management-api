// src/routes/ticket.routes.ts

import { Router } from 'express';
import { TicketController } from '../controllers/ticket.controller';
import { isAuth, hasRole } from '../middleware/authMiddleware';
import { validateRequest } from '../middleware/validateRequest';
import { createTicketSchema } from '../schemas/ticket.schema';

const router = Router();

// ==========================================
// MIDDLEWARE GLOBAL DEL ROUTER
// ==========================================
// Todas las rutas de tickets requieren que el usuario esté autenticado
router.use(isAuth);

// ==========================================
// ENDPOINTS DE TICKETS
// ==========================================

/**
 * @route   POST /api/tickets
 * @desc    Crea un nuevo ticket
 * @access  Privado (Cualquier rol autenticado puede crear un ticket)
 */
router.post(
    '/',
    hasRole(['CUSTOMER', 'AGENT', 'ADMIN']),
    validateRequest(createTicketSchema),
    TicketController.createTicket
);

/**
 * @route   GET /api/tickets
 * @desc    Obtiene la lista de tickets (filtrada por rol)
 */
router.get(
    '/',
  hasRole(['CUSTOMER', 'AGENT', 'ADMIN']), // Todos pueden entrar, el servicio filtra
    TicketController.getTickets
);

export default router;
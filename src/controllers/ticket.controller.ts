// src/controllers/ticket.controller.ts
import { Request, Response, NextFunction } from 'express';
import { TicketService } from '../services/ticket.service';

export class TicketController {
/**
   * Maneja la petición POST para crear un ticket
   */
static async createTicket(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // 1. Extraemos el ID del usuario directamente del token (¡NUNCA del body por seguridad!)
    const authorId = req.user!.id; 
    
      // 2. Extraemos los datos del body (que ya vienen limpios y validados por Zod)
    const { title, description, priority } = req.body;

      // 3. Delegamos la lógica de negocio al Servicio
    const ticket = await TicketService.createTicket({
        title,
        description,
        priority,
        authorId,
    });

      // 4. Retornamos la respuesta con el código HTTP correcto (201 Created)
    res.status(201).json({
        status: 'success',
        data: { ticket },
    });
    } catch (error) {
      // Si algo falla en la base de datos o el servicio, se lo pasamos al manejador global
        next(error); 
    }
    
}
static async getTickets(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // Extraemos ID y Rol del token de forma segura
      const userId = req.user!.id;
      const userRole = req.user!.role;

      // Llamamos al servicio pasando la información del usuario
      const tickets = await TicketService.getTickets(userId, userRole);

      res.status(200).json({
        status: 'success',
        results: tickets.length,
        data: { tickets },
      });
    } catch (error) {
      next(error);
    }
  }
}
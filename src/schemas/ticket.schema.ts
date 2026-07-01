import { z } from 'zod';

export const createTicketSchema = z.object({
    body: z.object({
    title: z.string()
        .min(5, 'El título debe tener al menos 5 caracteres y es requerido')
        .max(100, 'El título no puede exceder los 100 caracteres'),
    
    description: z.string()
        .min(10, 'La descripción es requerida y debe ser detallada (mínimo 10 caracteres)'),
    
    // La prioridad sigue siendo opcional
    priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional(),
}),
});
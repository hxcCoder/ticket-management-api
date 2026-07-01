import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';

// 1. Clase base para todos nuestros errores operacionales
export class AppError extends Error {
    public readonly statusCode: number;

constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    
    // FIX: Restaura la cadena de prototipos correctamente
    Object.setPrototypeOf(this, new.target.prototype);
}
}

// 2. Errores comunes predefinidos
export class NotFoundError extends AppError {
    constructor(message = 'Resource not found') {
    super(message, 404);
}
}

export class BadRequestError extends AppError {
    constructor(message = 'Bad request') {
    super(message, 400);
}
}

export class UnauthorizedError extends AppError {
    constructor(message = 'Unauthorized') {
    super(message, 401);  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Forbidden') {
    super(message, 403);
  }
}

// 3. Middleware Global
export const errorHandler = (
    err: Error,
    _req: Request,
    res: Response,
    _next: NextFunction
): void => {
  // Caso A: Validación de Zod
if (err instanceof ZodError) {
    res.status(400).json({
        status: 'error',
        message: 'Validation failed',
      // FIX: Usamos issues y tipamos el parámetro inferido
        errors: err.issues.map((e) => ({
        field: e.path.join('.'),
        message: e.message,
        })),
    });
    return;
}

  // Caso B: Errores controlados
if (err instanceof AppError) {
    res.status(err.statusCode).json({
        status: 'error',
        message: err.message,
    });
    return;
}

  // Caso C: Errores inesperados
console.error(' Unexpected Error:', err);

res.status(500).json({
    status: 'error',
    message: process.env.NODE_ENV === 'production' 
        ? 'Internal server error' 
        : err.message,
    });
};
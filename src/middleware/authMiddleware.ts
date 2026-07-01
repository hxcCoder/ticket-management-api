// src/middlewares/auth.middleware.ts

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AppError } from './errorHandler'; // Ajusta la ruta a tu AppError
import { TokenPayload, Role } from '../types/express/index'; // Ajusta la ruta

/**
 * Middleware de Autenticación (isAuth)
 * Verifica que el token exista y sea válido.
 */
export const isAuth = (req: Request, _res: Response, next: NextFunction) => {
    try {
    // 1. Extraer el token del header "Authorization: Bearer <token>"
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw new AppError('No estás autenticado. Por favor, inicia sesión.', 401);
    }

    const token = authHeader.split(' ')[1];

    // 2. Verificar el token
    // Ojo: En producción asegura tener process.env.JWT_SECRET definido
    const secret = process.env.JWT_SECRET || 'super-secret-dev-key'; 
    const decoded = jwt.verify(token, secret) as TokenPayload;

    // 3. Inyectar el payload en la request para uso futuro
    req.user = decoded;

    next();
} catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
        return next(new AppError('Tu sesión ha expirado. Inicia sesión nuevamente.', 401));
    }
    if (error instanceof jwt.JsonWebTokenError) {
        return next(new AppError('Token inválido.', 401));
    }
    next(error);
}
};

/**
 * Middleware de Autorización (hasRole)
 * Verifica que el usuario autenticado tenga los permisos necesarios.
 * Se debe usar SIEMPRE después de `isAuth`.
 */
export const hasRole = (roles: Role[]) => {
    return (req: Request, _res: Response, next: NextFunction) => {
    // req.user debería existir porque isAuth se ejecuta antes
    if (!req.user) {
        return next(new AppError('No se encontró información del usuario.', 401));
    }

    if (!roles.includes(req.user.role)) {
        return next(new AppError('No tienes permisos para realizar esta acción.', 403));
    }

    next();
};
};
// src/middlewares/validateRequest.ts
import { Request, Response, NextFunction } from 'express';
import { ZodObject } from 'zod';

export const validateRequest = (schema: ZodObject<any>) => {
    return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    try {
      // Valida body, query y params al mismo tiempo según el esquema provisto
    await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
    });
    next();
    } catch (error) {
      // Envía el error de Zod directamente al errorHandler global
    next(error);
    }
};
};
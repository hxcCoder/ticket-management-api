// src/types/express/index.d.ts

import { JwtPayload } from 'jsonwebtoken';

// Asegúrate de que los roles coincidan con tu schema.prisma
export type Role = 'CUSTOMER' | 'AGENT' | 'ADMIN';

export interface TokenPayload extends JwtPayload {
    id: string;
    role: Role;
}

declare global {
    namespace Express {
    export interface Request {
        user?: TokenPayload;
    }
}
}
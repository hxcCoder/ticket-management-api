import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';

// 1. Importa tus rutas aquí
// (Nota: Ajusta el path a './middleware/ticketRoutes' si decidiste no crear la carpeta 'routes')
import ticketRoutes from './routes/ticket.routes'; 
import { errorHandler, NotFoundError } from './middleware/errorHandler';

dotenv.config();

const app = express();

// Middlewares globales de infraestructura
app.use(helmet());
app.use(cors());
app.use(express.json());

// Endpoint de Health Check (esencial para balanceadores de carga)
app.get('/health', (_req, res) => {
    res.status(200).json({ 
        status: 'OK', 
        timestamp: new Date().toISOString() 
    });
});

// ==========================================
// 2. REGISTRO DE RUTAS DE LA API
// ==========================================
app.use('/api/tickets', ticketRoutes);

// NUEVO: Capturar cualquier ruta no definida (404) para que pase al errorHandler
app.use((req, _res, next) => {
    next(new NotFoundError(`La ruta ${req.originalUrl} no existe`));
});

// 3. MANEJADOR DE ERRORES GLOBAL
// El manejador de errores global SIEMPRE debe registrarse después de todas las rutas
app.use(errorHandler);

export default app;
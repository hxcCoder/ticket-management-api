// tests/app.test.ts
import request from 'supertest';
import app from '../app'; // Importamos la app de Express, NO el server que escucha el puerto

describe('Iniciando tests de Infraestructura', () => {
    
    describe('GET /health', () => {
      it('Debería retornar status 200 y un mensaje de OK', async () => {
        // Usamos supertest para hacer la petición a nuestra app
        const response = await request(app).get('/health');

        // Validamos el resultado
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('status', 'OK');
        expect(response.body).toHaveProperty('timestamp');
        });
    });

describe('Manejo de rutas inexistentes (404)', () => {
    it('Debería retornar un 404 para una ruta que no existe', async () => {
        const response = await request(app).get('/api/ruta-que-no-existe');
        
        expect(response.status).toBe(404);
        // Aquí validamos que tu errorHandler global esté atrapando esto y devolviendo tu formato estándar
        expect(response.body).toHaveProperty('status', 'error');
      });
    });
});
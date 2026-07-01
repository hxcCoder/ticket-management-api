# Ticket Management API

![Node.js](https://img.shields.io/badge/Node.js-v18+-339933?style=flat-square&logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express-4.x-000000?style=flat-square&logo=express&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=flat-square&logo=typescript&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Database-4169E1?style=flat-square&logo=postgresql&logoColor=white)
![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)
![Coverage](https://img.shields.io/badge/coverage-85%25-brightgreen)

API REST para la gestión de tickets de soporte, construida con Node.js, Express, TypeScript y Prisma. Incluye autenticación JWT, control de acceso por roles, validación de datos con Zod y manejo centralizado de errores.

Proyecto personal, pensado como ejercicio de arquitectura en capas (controllers, services, middlewares) y testing automatizado con Jest.

---

## Tabla de Contenidos

- [Características](#características)
- [Tecnologías](#tecnologías)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [Requisitos Previos](#requisitos-previos)
- [Instalación y Configuración](#instalación-y-configuración)
- [Variables de Entorno](#variables-de-entorno)
- [Endpoints de la API](#endpoints-de-la-api)
- [Pruebas](#pruebas)
- [Contribución](#contribución)
- [Licencia](#licencia)

---

## Características

- **Autenticación JWT** — el middleware `isAuth` valida el token y adjunta el usuario a la request.
- **Autorización por roles** (`CUSTOMER`, `AGENT`, `ADMIN`) mediante el middleware `hasRole`.
- **Validación de datos** con Zod, a través del middleware `validateRequest` (body, query y params).
- **Manejo centralizado de errores** con la clase `AppError` y captura específica de errores de Zod (400, 401, 403, 404).
- **Persistencia con Prisma ORM** sobre PostgreSQL.
- **Pruebas automatizadas** con Jest y Supertest, con mocks de Prisma y de autenticación.
- **Seguridad básica**: Helmet para cabeceras HTTP y CORS configurado. El `authorId` se obtiene del token, no del body, para evitar que un usuario cree tickets a nombre de otro.
- **Health check** en `/health` para verificar que el servicio esté activo.

---

## Tecnologías

| Tecnología | Uso |
|---|---|
| Node.js | Entorno de ejecución |
| Express | Framework web |
| TypeScript | Tipado estático |
| Prisma | ORM y migraciones |
| Zod | Validación de esquemas |
| JWT | Autenticación |
| Jest + Supertest | Pruebas |
| Helmet | Seguridad de cabeceras |
| CORS | Cross-Origin Resource Sharing |
| dotenv | Variables de entorno |

---

## Estructura del Proyecto

```
├── __tests__/
│   └── app.test.ts              # Pruebas de infraestructura (health, 404)
├── config/
│   └── prisma.ts                # Instancia de Prisma Client
├── controllers/
│   └── ticket.controller.ts     # Controladores de tickets
├── middleware/
│   ├── authMiddleware.ts        # isAuth y hasRole
│   ├── errorHandler.ts          # AppError y middleware global
│   └── validateRequest.ts       # Validador con Zod
├── routes/
│   ├── __tests__/
│   │   └── ticket.routes.test.ts # Pruebas de integración de rutas
│   └── ticket.routes.ts         # Rutas de tickets
├── schemas/
│   └── ticket.schema.ts         # Esquemas Zod para validación
├── services/
│   ├── __tests__/
│   │   └── ticket.service.test.ts # Pruebas unitarias del servicio
│   └── ticket.service.ts        # Lógica de negocio
├── types/
│   └── express/
│       └── index.d.ts           # Extensión de tipos de Express (Request.user)
├── app.ts                       # Configuración de Express
├── server.ts                    # Punto de entrada
├── .env.example                 # Variables de entorno (ejemplo)
├── package.json
├── tsconfig.json
├── jest.config.js
└── README.md
```

---

## Requisitos Previos

- Node.js v18 o superior
- npm o yarn
- Base de datos PostgreSQL (u otra soportada por Prisma)

---

## Instalación y Configuración

**1. Clonar el repositorio**

```bash
git clone https://github.com/tu-usuario/ticket-api.git
cd ticket-api
```

**2. Instalar dependencias**

```bash
npm install
```

**3. Configurar variables de entorno**

Crea un archivo `.env` en la raíz basado en `.env.example` (ver [Variables de Entorno](#variables-de-entorno)).

**4. Configurar Prisma**

Con el archivo `prisma/schema.prisma` ya definido (modelos `Ticket` y `User`):

```bash
npx prisma generate
npx prisma migrate dev --name init
```

**5. Iniciar el servidor en modo desarrollo**

```bash
npm run dev
```

El servidor queda disponible en `http://localhost:3000`.

---

## Variables de Entorno

```env
# Puerto del servidor
PORT=3000

# URL de conexión a la base de datos (PostgreSQL)
DATABASE_URL="postgresql://usuario:password@localhost:5432/ticket_db"

# Clave secreta para JWT (cambiar en producción)
JWT_SECRET=tu_clave_super_secreta

# Entorno (development, production, test)
NODE_ENV=development
```

---

## Endpoints de la API

Todos los endpoints de tickets requieren autenticación (header `Authorization: Bearer <token>`).

### Health Check

| Método | Endpoint | Descripción |
|---|---|---|
| `GET` | `/health` | Verifica que la API esté en funcionamiento |

```json
{
  "status": "OK",
  "timestamp": "2026-07-01T12:00:00.000Z"
}
```

### Tickets

| Método | Endpoint | Descripción | Roles permitidos |
|---|---|---|---|
| `POST` | `/api/tickets` | Crear un nuevo ticket | `CUSTOMER`, `AGENT`, `ADMIN` |
| `GET` | `/api/tickets` | Listar tickets (filtrado por rol) | `CUSTOMER`, `AGENT`, `ADMIN` |

#### `POST /api/tickets`

Body:

```json
{
  "title": "Problema con el login",
  "description": "No puedo iniciar sesión después de actualizar la app",
  "priority": "HIGH"
}
```

`priority` es opcional: `LOW`, `MEDIUM`, `HIGH`, `URGENT`.

Respuesta (`201 Created`):

```json
{
  "status": "success",
  "data": {
    "ticket": {
      "id": "ticket-1",
      "title": "Problema con el login",
      "status": "OPEN",
      "priority": "HIGH",
      "createdAt": "2026-07-01T12:00:00.000Z",
      "author": {
        "id": "user-123",
        "name": "Juan Pérez",
        "email": "juan@example.com"
      }
    }
  }
}
```

Errores posibles: `400` (validación), `401` (no autenticado), `403` (sin permisos).

#### `GET /api/tickets`

Respuesta (`200 OK`). `CUSTOMER` ve solo sus propios tickets; `AGENT` y `ADMIN` ven todos:

```json
{
  "status": "success",
  "results": 2,
  "data": {
    "tickets": [
      {
        "id": "1",
        "title": "Ticket 1",
        "status": "OPEN",
        "priority": "HIGH",
        "createdAt": "2026-07-01T10:00:00.000Z",
        "author": {
          "name": "Ana Gómez",
          "email": "ana@example.com"
        }
      }
    ]
  }
}
```

---

## Pruebas

El proyecto incluye pruebas unitarias y de integración con Jest y Supertest.

Ejecutar todas las pruebas:

```bash
npm test
```

Ejecutar pruebas con cobertura:

```bash
npm run test:coverage
```

Estructura de pruebas:

- `__tests__/app.test.ts` — infraestructura (health check, manejo de 404).
- `routes/__tests__/ticket.routes.test.ts` — integración de endpoints de tickets (mocks de autenticación y Prisma).
- `services/__tests__/ticket.service.test.ts` — pruebas unitarias del `TicketService`.

---

## Contribución

Es un proyecto personal, pero cualquier sugerencia o corrección es bienvenida. Puedes abrir un issue o enviar un pull request.

---

## Licencia

Este proyecto usa la licencia MIT. Ver el archivo `LICENSE` para más detalles.

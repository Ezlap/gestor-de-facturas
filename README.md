# Gestión de facturas con extracción por LLM

Aplicación web que permite cargar facturas (PDF, PNG, JPG), extraer sus datos con un modelo de lenguaje, guardarlas en SQL Server y consultarlas desde una interfaz Angular.

## Stack
- Frontend: Angular (TypeScript)
- Backend: Node.js con NestJS (TypeScript)
- Base de datos: SQL Server (Docker)
- LLM: Flash de Gemini 

## Requisitos
- Node.js (LTS), Docker Desktop, Git

## Puesta en marcha
1. Copia `.env.example` a `.env` y define `mi_contraseña_super_secreta`.
2. Copia `backend/.env.example` a `backend/.env` con los mismos datos.
3. `docker compose up -d`
4. Crea la base y ejecuta `database/01_schema.sql`.
5. Backend: `cd backend && npm install && npm run start:dev`
6. Frontend: `cd frontend && npm install && ng serve`
7. Verifica: `http://localhost:3000/api/health` y `http://localhost:4200`

## Variables de entorno
| Variable | Descripción |
| :--- | :---: |
| mi_contraseña_super_secreta | Contraseña de SQL Server |
| LLM_API_KEY | Clave del proveedor de LLM (no se sube al repositorio) |

## API REST

Base: `http://localhost:3000/api`

| Método | Ruta | Descripción | Respuestas |
|---|---|---|---|
| GET | `/facturas` | Lista paginada, con filtros `proveedor`, `desde`, `hasta`, `page`, `pageSize` | 200, 400 |
| GET | `/facturas/:id` | Detalle de una factura | 200, 400, 404 |
| PUT | `/facturas/:id` | Corrige los datos de una factura | 200, 400, 404, 409, 422 |
| DELETE | `/facturas/:id` | Eliminación lógica | 204, 400, 404 |

### Formato de errores
Todos los errores usan el formato *Problem Details* (`application/problem+json`):

```json
{
  "type": "about:blank",
  "title": "Recurso no encontrado",
  "status": 404,
  "detail": "No existe la factura con id 999.",
  "instance": "/api/facturas/999"
}
```

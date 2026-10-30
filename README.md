# Gestión de facturas con extracción por LLM

Aplicación web que permite cargar facturas (PDF, PNG, JPG), extraer sus datos con un modelo de lenguaje, guardarlas en SQL Server y consultarlas desde una interfaz Angular.

## Stack
- Frontend: Angular (TypeScript)
- Backend: Node.js con NestJS (TypeScript)
- Base de datos: SQL Server (Docker)
- LLM: gemini-3.1-flash-lite-preview

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
| LLM_API_KEY | Clave del proveedor de LLM |

## API REST

Base: `http://localhost:3000/api`

| Método | Ruta | Descripción | Respuestas |
|---|---|---|---|
| POST | `/facturas` | Recibe el archivo, invoca el LLM valida y almacena el resultado | 201, 400, 409, 413, 415, 422, 502  |
| GET | `/facturas` | Lista paginada, con filtros `proveedor`, `desde`, `hasta`, `page`, `pageSize` | 200, 400 |
| GET | `/facturas/:id` | Devuelve el detalle de una factura | 200, 400, 404 |
| PUT | `/facturas/:id` | Corrige los datos de una factura | 200, 400, 404, 409, 422 |
| DELETE | `/facturas/:id` | Eliminación lógica | 204, 400, 404 |
| GET | `/facturas/reportes/resumen` | Total facturado por proveedor, mes y moneda (no suma monedas distintas ni facturas eliminadas) | 200, 500 |

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

### Decisiones de diseño
- **Eliminación lógica:** una factura es un documento contable que conviene conservar para auditoría. Se marca `eliminada = 1` y deja de aparecer en listados. El índice único es filtrado, así que se puede volver a cargar una factura eliminada.
- **Duplicados:** los controla la base de datos con un índice único sobre (proveedor, número de factura); la API responde 409.
- **Actualización:** el `PUT` se ejecuta en una transacción (resolver el proveedor y guardar la factura). La fecha límite de pago anterior a la de emisión devuelve 422.

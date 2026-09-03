# Macsa CMMS API

API REST en **Node.js + Express** que expone la base de datos **SQL Server `MacsaCMMS`** del sistema CMMS de Grupo Macsa. Toda la lógica de negocio vive en los 52 stored procedures de la base de datos; esta API es una capa fina de transporte, autenticación JWT y autorización RBAC.

## Requisitos

- Node.js 20.6+ (usa `--env-file` nativo; probado con Node 26)
- SQL Server con la base de datos `MacsaCMMS` inicializada (`database/init.sql` del repositorio principal)
- TCP habilitado en SQL Server (puerto 1433) — node-mssql solo habla TCP
- Un login SQL con acceso de ejecución (ver "Seguridad" abajo)

## Puesta en marcha

```bash
npm install
copy .env.example .env   # editar credenciales y JWT_SECRET
npm start                # node --env-file=.env src/server.js
npm run dev              # modo watch
npm run prod             # ejecutar en segundo plano con PM2
npm run prod:status      # ver estado del proceso
npm run prod:logs        # ver logs en vivo
npm run prod:restart     # reiniciar proceso
npm run prod:stop        # detener proceso
```

La API queda en `http://localhost:3000/api`.

### Crear el login técnico en SQL Server

```sql
-- como administrador
CREATE LOGIN macsa_app WITH PASSWORD = N'<CLAVE_FUERTE>', CHECK_POLICY = ON;
GO
USE MacsaCMMS;
CREATE USER macsa_app_user FOR LOGIN macsa_app;
ALTER ROLE macsa_app ADD MEMBER macsa_app_user;
```

El rol `macsa_app` (creado por `init.sql`) tiene `DENY INSERT/UPDATE/DELETE` sobre el esquema `dbo` y solo `EXECUTE`: **la única vía de escritura son los SPs**.

## Arquitectura

```
src/
├── config/
│   ├── env.js                  # validación de variables de entorno (fail-fast)
│   └── db.js                   # pool mssql + execProc + builders de TVP
├── security/
│   ├── password.js             # PBKDF2-HMAC-SHA256 idéntico a lib/core/security/password_hasher.dart
│   ├── jwt.js                  # firma/verificación de tokens
│   └── rolePermissions.js      # catálogo roles/permisos espejo de user_role.dart
├── middleware/
│   ├── auth.middleware.js      # requireAuth (Bearer JWT)
│   ├── permission.middleware.js# requirePermission / requireRole
│   ├── validate.middleware.js  # recolector de express-validator
│   └── error.middleware.js     # mapea números THROW 50xxx → HTTP 400/404/409
├── services/                   # 1 archivo por módulo; cada función = un SP
├── controllers/
└── routes/                     # montaje + reglas RBAC por endpoint
```

### Decisiones clave

| Tema | Decisión |
|---|---|
| Escritura | Solo vía SPs (el login técnico no puede hacer DML directo). |
| Login | Verificación PBKDF2 en Node (`crypto.pbkdf2Sync` + `timingSafeEqual`), candado por `uspLoginRegisterFailure` / `uspLoginResetAttempts`. |
| Permisos | Embebidos en el JWT al hacer login, calculados desde `rolePermissions.js` (espejo exacto de `user_role.dart`; `admin` pasa todo). |
| Errores SP | `THROW` 50000-50599 → HTTP: 404 no-existe, 409 conflicto/integridad, resto 400. Mensajes originales en español se propagan tal cual. |
| TVPs | Materiales de OT y preventivos via `mssql.Table` (`WorkOrderMaterialType`, `PreventiveMaterialType`, `StringListType`). |
| Fechas | Siempre `DateTime2` explícito (`typed(sql.DateTime2, ...)`). |
| Reset contraseña | Solicitud pública → admin lista pendientes → resolver genera contraseña temporal (se muestra UNA vez) y marca resuelta. |

## Endpoints

Prefijo común `/api`. Todos requieren `Authorization: Bearer <token>` salvo los marcados como públicos.

### Auth (`/auth`)
| Método | Ruta | Permiso | Descripción |
|---|---|---|---|
| POST | `/login` | público | Devuelve `{ token, user }` |
| POST | `/password-reset-requests` | público | Solicita reset |
| GET | `/me` | sesión | Datos del token |
| PUT | `/me/password` | sesión | Cambio propio (valida actual) |
| GET | `/password-reset-requests` | `user.manage` | Pendientes |
| POST | `/password-reset-requests/:id/resolve` | `user.manage` | Genera temporal |

### Usuarios (`/users`) — todo requiere `user.manage`
GET `/`, GET `/:id`, POST `/`, PUT `/:id`, PATCH `/:id/disabled`

### Áreas (`/areas`)
GET `/` (`asset.view`), POST `/` (`asset.create`), PUT `/:areaId` (`asset.edit`)

### Activos (`/assets`)
| Método | Ruta | Permiso |
|---|---|---|
| GET | `/?parent=` | `asset.view` — sin parent = raíces |
| GET | `/search?q=` | `asset.view` |
| GET | `/serial/:serial` | `asset.view` |
| GET | `/area/:areaId` | `asset.view` |
| POST | `/` | `asset.create` |
| PUT | `/:assetCode` | `asset.edit` |
| POST | `/:assetCode/transfer` | `asset.transfer` |
| POST | `/:assetCode/reactivate` | `asset.transfer` |
| PATCH | `/:assetCode/status` | `asset.edit` |

### Bajas (`/deletion-requests`)
GET `/` y GET `/pending` (`asset.delete.approve`), GET `/asset/:code` (`asset.view`),
POST `/` (`asset.delete.request`), POST `/:id/approve` y `/:id/reject` (`asset.delete.approve`)

### Órdenes de trabajo (`/work-orders`)
GET `/` y `/open` (`work_order.view`), POST `/` (`work_order.create` con TVP de materiales y tipos de trabajo),
PATCH `/:id/status` y PUT `/:id` (`work_order.create`)

### Averías (`/breakdown-reports`)
GET `/` y `/open` (`breakdown.view`), GET `/mine` y POST `/` (`breakdown.report`),
POST `/:id/link-work-order`, `/:id/resolve`, `/:id/reject` (`breakdown.manage`)

### Preventivos (`/preventive-schedules`)
GET `/` (`preventive.view`), POST `/` y POST `/:id/executions` (`work_order.create`),
PUT `/:id` (modificación formal) y PATCH `/:id/status` (`asset.edit` — exigen oficio, gerente y justificación si aplica)

### Kardex (`/kardex`)
GET `/` y `/entity/:entityId` (`kardex.view`) — solo lectura (append-only en BD).

### Dashboard (`/dashboard`)
GET `/stats` (`dashboard.view`)

## Ejemplos

```bash
# login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"1234"}'

# crear OT con materiales y tipos (TVPs)
curl -X POST http://localhost:3000/api/work-orders \
  -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d '{
    "assetCode": "A1-001", "assetName": "Bomba centrífuga KSB Etanorm 80",
    "areaId": "A1", "areaName": "Planta de Procesamiento",
    "description": "Cambio de rodamientos", "priority": "high",
    "scheduledDate": "2026-09-01T08:00:00",
    "materials": [{"description":"Rodamiento SKF 6206","quantity":2,"unit":"pza"}],
    "workTypes": ["mechanical"]
  }'

# error de negocio propagado desde el SP
# {"message":"Ya existe un área con ese nombre o centro de coste.","spErrorNumber":50100} (HTTP 409)
```

## Roles y permisos

Catálogo espejo de `lib/features/auth_permissions/domain/entities/user_role.dart`:

- `admin`: todos los permisos (bypass).
- `jefe`: dashboard, ver activos, OTs completas, preventivos, kardex, gestionar averías.
- `reportador`: reportar/ver averías.
- `lector`: lectura general (dashboard, activos, OTs, preventivos, kardex, averías).

Los permisos viajan en el JWT (`permissions[]`); el middleware combina rol + extras. La autorización es UI/API: las rules de integridad siguen viviendo en los SPs/triggers.

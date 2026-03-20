# Cars API

API REST CRUD construida con Node.js, Express y PostgreSQL, completamente containerizada con Docker. El dominio del recurso es el universo de la película **Cars** — cada registro representa un corredor con su información de competencia.

---

## Stack

| Capa | Tecnología |
|---|---|
| Runtime | Node.js 20 Alpine |
| Framework | Express 4 |
| Base de datos | PostgreSQL 16 Alpine |
| Driver DB | pg (node-postgres) |
| Servidor estático | Nginx Alpine |
| Containerización | Docker + Docker Compose |

---

## Requisitos previos

- Docker Desktop instalado y corriendo
- Puertos `8080` y `8088` disponibles

---

## Levantar el sistema

```bash
git clone <url-del-repositorio>
cd Lab4-Rest
cp .env.example .env
docker-compose up --build
```

Un único comando levanta los tres servicios: base de datos, API y frontend.

| Servicio | URL |
|---|---|
| Frontend | http://localhost:8088 |
| API | http://localhost:8080/cars |

---

## Variables de entorno

Copia `.env.example` a `.env` y completa los valores:

```env
DB_HOST=postgres
DB_PORT=5432
DB_NAME=carsdb
DB_USER=carsuser
DB_PASSWORD=carspassword
APP_PORT=8080
```

> `.env` está en `.gitignore` y nunca debe subirse al repositorio. Solo `.env.example` se versiona.

---

## Estructura del proyecto

```
Lab4-Rest/
├── api/
│   ├── db.js          # Pool de conexión a PostgreSQL
│   ├── routes.js      # Endpoints con validaciones
│   ├── server.js      # Punto de entrada
│   ├── package.json
│   └── Dockerfile
├── db/
│   └── init.sql       # Schema ejecutado automáticamente al primer arranque
├── frontend/          # Frontend estático servido por Nginx
├── .env               # Variables reales (no versionado)
├── .env.example       # Plantilla de variables (versionado)
├── .gitignore
└── docker-compose.yml
```

---

## Recurso: `/cars`

| Campo | Tipo JSON | Tipo SQL | Descripción |
|---|---|---|---|
| `id` | integer | SERIAL PK | Identificador autoincremental |
| `campo1` | string | VARCHAR(255) | Nombre del corredor |
| `campo2` | string | VARCHAR(255) | Color del carro |
| `campo3` | string | VARCHAR(255) | Número del carro |
| `campo4` | integer | INTEGER | Año del modelo |
| `campo5` | float | NUMERIC(10,2) | Velocidad máxima (mph) |
| `campo6` | boolean | BOOLEAN | ¿Compite actualmente? |

---

## Endpoints

| Método | Ruta | Descripción | Código |
|---|---|---|---|
| GET | `/cars` | Obtener todos los registros | 200 |
| GET | `/cars/:id` | Obtener un registro por ID | 200 |
| POST | `/cars` | Crear un nuevo registro | 201 |
| PUT | `/cars/:id` | Actualizar un registro completo | 200 |
| DELETE | `/cars/:id` | Eliminar un registro | 204 |

### Códigos de respuesta

| Código | Cuándo ocurre |
|---|---|
| 200 OK | GET y PUT exitosos |
| 201 Created | POST exitoso |
| 204 No Content | DELETE exitoso |
| 404 Not Found | ID no existe |
| 422 Unprocessable | Validación fallida |
| 500 Internal Error | Error inesperado en la base de datos |

---

## Ejemplos

### Crear un registro

```http
POST http://localhost:8080/cars
Content-Type: application/json

{
  "campo1": "Lightning McQueen",
  "campo2": "Rojo",
  "campo3": "95",
  "campo4": 2006,
  "campo5": 198.5,
  "campo6": true
}
```

**Respuesta — 201 Created**

```json
{
  "id": 1,
  "campo1": "Lightning McQueen",
  "campo2": "Rojo",
  "campo3": "95",
  "campo4": 2006,
  "campo5": 198.5,
  "campo6": true
}
```

### Error de validación

```json
{
  "errors": [
    "campo4 es requerido y debe ser integer"
  ]
}
```

---

## Validaciones

Todos los campos son requeridos. Las reglas aplicadas antes de cualquier escritura:

- `campo1`, `campo2`, `campo3` — strings no vacíos
- `campo4` — número entero
- `campo5` — número decimal
- `campo6` — estrictamente `true` o `false`

Si alguna falla, la API responde `422` con un array de errores. No se ejecuta ningún query.

---

## Infraestructura Docker

El `docker-compose.yml` orquesta tres servicios:

**postgres**
- Imagen `postgres:16-alpine`
- Credenciales inyectadas desde variables de entorno, sin valores hardcodeados
- `init.sql` montado en `/docker-entrypoint-initdb.d/` — crea la tabla automáticamente al primer arranque
- Volumen nombrado `postgres_data` para persistencia entre reinicios
- Healthcheck con `pg_isready` cada 5 segundos

**api**
- Construida desde `api/Dockerfile` con `node:20-alpine`
- `depends_on` con `condition: service_healthy` — no arranca hasta que Postgres esté listo
- Variables inyectadas con `env_file`

**frontend**
- Nginx sirviendo los archivos estáticos del frontend
- Personalizado con nombres del dominio Cars en las etiquetas

---

## Detener el sistema

```bash
# Detener servicios
docker-compose down

# Detener y eliminar todos los datos
docker-compose down -v
```

---

## Nivel entregado

**Nivel 2 — Mid** con ambos bonus completados.

| Ítem | Puntos |
|---|---|
| Nivel 2 — Mid (PostgreSQL, docker-compose, variables de entorno, healthcheck) | hasta 85/100 |
| Bonus integración full stack (frontend en docker-compose, un solo comando) | +10 |
| Bonus personalización frontend (etiquetas en español con nombres del dominio) | +5 |
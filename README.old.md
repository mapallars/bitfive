# Bitfive DevOps Project

> Monorepo fullstack compuesto por un backend REST en **Node.js + TypeScript** y un frontend en **Vite + React**. El proyecto implementa un sistema completo de autenticación y autorización basado en roles y permisos, con una arquitectura modular en capas y un ORM personalizado construido desde cero.

---

## 📁 Estructura del monorepo

```
bitfive/
├── api/          → Backend (Node.js + TypeScript)
└── app/          → Frontend (Vite + React)
```

Cada workspace es un proyecto independiente con su propio `package.json`, dependencias y proceso de arranque. No existe un `package.json` raíz ni un gestor de workspaces (por ejemplo, `npm workspaces` o `turborepo`); ambos subproyectos se levantan de forma individual.

---

## 🏗️ Arquitectura general

```
┌─────────────────────────────────────────┐
│              Frontend (app)             │
│  Vite + React + React Router DOM        │
│  Puerto: 5173 (dev)                     │
└───────────────┬─────────────────────────┘
                │  HTTP / JSON REST API
                ▼
┌─────────────────────────────────────────┐
│              Backend (api)              │
│  Express 5 + Node.js + TypeScript       │
│  Puerto: 3000 — Prefijo: /api/v1        │
└───────────────┬─────────────────────────┘
                │  SQL (pg driver)
                ▼
┌─────────────────────────────────────────┐
│           PostgreSQL                    │
│  Schema gestionado por ORM propio       │
└─────────────────────────────────────────┘
```

### Interacción backend ↔ frontend

| Aspecto | Detalle |
|---|---|
| Protocolo | HTTP/1.1 REST |
| Formato | JSON |
| Autenticación | JWT enviado como `Authorization` header o cookie `accessToken` |
| URL base (dev) | `http://localhost:3000/api/v1` |
| URL base (prod) | Configurable en `app/src/core/config/api.config.mjs` |
| Proxy Vite | En desarrollo, `/api` se redirige al servidor remoto de producción para las rutas que lo necesiten |

El frontend almacena la sesión (`token` + datos del usuario) en `localStorage` bajo la clave `session`. En cada petición autenticada, el `Requester` inyecta automáticamente el token en la cabecera `Authorization`.

---

## 🚀 Configuración del entorno de desarrollo

### Prerrequisitos

| Herramienta | Versión mínima recomendada |
|---|---|
| Node.js | ≥ 20 LTS |
| npm | ≥ 10 |
| PostgreSQL | ≥ 14 |

### 1. Clonar el repositorio

```bash
git clone <url-del-repositorio>
cd bitfive
```

### 2. Configurar el backend

```bash
cd api
cp .env.example .env   # o crear el archivo .env manualmente
npm install
npm run dev
```

> El servidor arranca en `http://localhost:3000`. Consulta `/api/README.md` para la referencia completa de variables de entorno.

### 3. Configurar el frontend

```bash
cd app
npm install
npm run dev
```

> La aplicación arranca en `http://localhost:5173`.

---

## 🌐 Variables de entorno globales

No existen variables de entorno compartidas a nivel de monorepo. Cada workspace gestiona sus propias:

| Workspace | Archivo | Descripción |
|---|---|---|
| `api` | `.env` | Configuración del servidor, base de datos y JWT |
| `app` | *(no usa `.env` de Vite actualmente)* | La URL base de la API se configura directamente en `api.config.mjs` |

---

## 📦 Módulos del sistema

### Backend (`/api`)

El dominio principal implementado es **autenticación y autorización**:

- **Usuarios** — registro, login, logout, perfil, cambio de contraseña
- **Roles** — CRUD, asignación/revocación a usuarios
- **Permisos** — CRUD, asignación/revocación a roles
- **Tokens bloqueados** — lista negra de JWTs revocados al hacer logout

### Frontend (`/app`)

La aplicación implementa un **panel de administración** con las siguientes vistas:

- **Autenticación** — formulario de login y registro
- **Dashboard** — resumen visual del sistema
- **Autorizaciones** — gestión de roles y permisos
- **Usuarios** — gestión de cuentas de usuarios

---

## 📚 Documentación detallada

| Proyecto | Documento |
|---|---|
| Backend | [`/api/README.md`](./api/README.md) |
| Frontend | [`/app/README.md`](./app/README.md) |

---

## 👥 Autoría

**Bitfive** — Proyecto DevOps  
Versión: `1.0.0`
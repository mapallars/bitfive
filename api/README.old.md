# API — Bitfive DevOps Project

> Backend REST construido con **Node.js**, **TypeScript**, **Express 5** y un **ORM personalizado** que se comunica con **PostgreSQL** mediante el driver nativo `pg`. Implementa una arquitectura modular en capas con inyección de dependencias declarativa mediante decoradores personalizados.

---

## Tabla de contenidos

1. [Arquitectura](#1-arquitectura)
2. [Estructura de directorios](#2-estructura-de-directorios)
3. [Sistema de decoradores](#3-sistema-de-decoradores)
4. [ORM personalizado](#4-orm-personalizado)
5. [Contenedor de dependencias](#5-contenedor-de-dependencias)
6. [Sistema de enrutamiento](#6-sistema-de-enrutamiento)
7. [Middlewares](#7-middlewares)
8. [Gestión de errores](#8-gestión-de-errores)
9. [Módulo de autenticación y autorización](#9-módulo-de-autenticación-y-autorización)
10. [Patrones de diseño](#10-patrones-de-diseño)
11. [Variables de entorno](#11-variables-de-entorno)
12. [Instalación y ejecución](#12-instalación-y-ejecución)

---

## 1. Arquitectura

El backend sigue un **Monolito Modular** organizado en **N capas** (N-layered architecture). El flujo de datos entre capas es estrictamente unidireccional:

```
HTTP Request
     │
     ▼
┌──────────────────────────────────────────┐
│            @Controller                   │  ← Recibe la solicitud HTTP,
│  Valida entradas, delega al servicio,    │    delega al servicio, formatea
│  devuelve respuesta HTTP.                │    la respuesta HTTP.
└────────────────┬─────────────────────────┘
                 │ llama a
                 ▼
┌──────────────────────────────────────────┐
│              @Service                    │  ← Contiene la lógica de negocio.
│  Orquesta múltiples repositorios,        │    No conoce ni HTTP ni SQL,
│  aplica reglas de negocio.               │    solo trabaja con entidades.
└────────────────┬─────────────────────────┘
                 │ llama a
                 ▼
┌──────────────────────────────────────────┐
│            @Repository                   │  ← Abstrae el acceso a datos.
│  Hereda de BaseRepository<T>,            │    Solo conoce SQL y el ORM.
│  expone operaciones CRUD.                │
└────────────────┬─────────────────────────┘
                 │ persiste/consulta
                 ▼
┌──────────────────────────────────────────┐
│              @Entity                     │  ← Definición del modelo de datos.
│  Clase anotada con decoradores ORM.      │    Mapea propiedades a columnas SQL.
└──────────────────────────────────────────┘
```

Cada capa se comunica **exclusivamente** con la capa inmediatamente inferior. Un `@Controller` jamás accede directamente a un `@Repository`.

---

## 2. Estructura de directorios

```
api/
├── src/
│   ├── index.ts                    ← Punto de entrada de la aplicación
│   ├── core/                       ← Infraestructura transversal del framework
│   │   ├── config/                 ← Variables de configuración exportadas
│   │   │   └── api.config.ts
│   │   ├── constants/              ← Constantes globales (códigos de error, etc.)
│   │   ├── container/              ← Contenedor de inyección de dependencias
│   │   │   └── Core.container.ts
│   │   ├── decorators/             ← Todos los decoradores del framework
│   │   │   ├── decorators.ts       ← Barrel: re-exporta todos los decoradores
│   │   │   ├── controller.decorator.ts
│   │   │   ├── service.decorator.ts
│   │   │   ├── repository.decorator.ts
│   │   │   ├── inject.decorator.ts
│   │   │   ├── route.decorator.ts
│   │   │   ├── auth.decorator.ts
│   │   │   ├── public.decorator.ts
│   │   │   ├── handler.decorator.ts
│   │   │   ├── middleware.decorator.ts
│   │   │   └── router.decorator.ts
│   │   ├── errors/                 ← Jerarquía de errores manejables
│   │   │   ├── Handleable.error.ts ← Clase base de todos los errores de negocio
│   │   │   ├── NotFound.error.ts
│   │   │   ├── Unauthorized.error.ts
│   │   │   ├── Forbidden.error.ts
│   │   │   ├── InvalidCredentials.error.ts
│   │   │   ├── InvalidFormat.error.ts
│   │   │   ├── AlreadyExist.error.ts
│   │   │   ├── NotImplemented.error.ts
│   │   │   └── TokenRequired.error.ts
│   │   ├── handlers/
│   │   │   └── Route.handler.ts    ← Interceptor de cada ruta HTTP
│   │   ├── helpers/
│   │   ├── metadata/               ← Abstracción sobre reflect-metadata
│   │   │   ├── Metadata.ts         ← Wrapper tipado de Reflect
│   │   │   ├── keys.ts             ← Claves Symbol únicas para cada metadato
│   │   │   └── metadata.map.ts     ← Mapa TypeScript de clave → tipo de dato
│   │   ├── middlewares/
│   │   │   ├── Auth.middleware.ts  ← Verificación de JWT y carga del usuario
│   │   │   └── Error.middleware.ts ← Manejador global de errores Express
│   │   ├── orm/                    ← ORM personalizado
│   │   │   ├── config/
│   │   │   │   └── database.config.ts
│   │   │   ├── database/
│   │   │   │   ├── Database.ts     ← Singleton de conexión + auto-sync
│   │   │   │   └── scripts/
│   │   │   │       └── init.sql    ← Datos semillas iniciales
│   │   │   ├── decorators/
│   │   │   │   ├── decorators.ts   ← Barrel del ORM
│   │   │   │   ├── entity.decorator.ts
│   │   │   │   ├── id.decorator.ts
│   │   │   │   ├── column.decorator.ts
│   │   │   │   └── relations/
│   │   │   │       └── relations.decorator.ts
│   │   │   ├── metadata/
│   │   │   │   ├── orm.metadata.ts ← Interfaces de configuración
│   │   │   │   └── orm.registry.ts ← Registro global de entidades
│   │   │   └── repository/
│   │   │       └── Base.repository.ts ← CRUD genérico + carga de relaciones
│   │   ├── router/
│   │   │   └── Core.router.ts      ← Auto-descubrimiento y registro de rutas
│   │   ├── tests/
│   │   └── utils/
│   │       └── Validator.ts        ← Utilidad fluida de validación
│   └── auth/                       ← Módulo de autenticación/autorización
│       ├── config/
│       ├── constants/
│       │   └── authorities.ts      ← Constantes de permisos del sistema
│       ├── controllers/
│       │   ├── Auth.controller.ts
│       │   ├── Authentication.controller.ts
│       │   ├── Authorization.controller.ts
│       │   ├── Permission.controller.ts
│       │   ├── Role.controller.ts
│       │   └── User.controller.ts
│       ├── dtos/
│       │   └── User.dto.ts         ← Proyección de datos del usuario sin password
│       ├── entities/
│       │   ├── User.entity.ts
│       │   ├── Role.entity.ts
│       │   ├── Permission.entity.ts
│       │   └── BlockedToken.entity.ts
│       ├── errors/
│       ├── repositories/
│       │   ├── User.repository.ts
│       │   ├── Role.repository.ts
│       │   ├── Permission.repository.ts
│       │   └── BlockedToken.repository.ts
│       └── services/
│           ├── User.service.ts
│           ├── Role.service.ts
│           ├── Permission.service.ts
│           └── BlockedToken.service.ts
├── .env
├── package.json
└── tsconfig.json
```

---

## 3. Sistema de decoradores

El proyecto implementa un **sistema de programación declarativa** mediante decoradores TypeScript propios. Todos los decoradores se basan en la API `reflect-metadata` y utilizan una capa de abstracción central: la clase `Metadata`.

### 3.1 Infraestructura de metadatos

#### `Metadata` — `src/core/metadata/Metadata.ts`

Wrapper tipado y estático sobre `Reflect`. Garantiza type-safety en tiempo de compilación mediante el tipo `MetadataMap`.

```typescript
export class Metadata {
    static set<K extends keyof MetadataMap>(target: any, key: K, value: MetadataMap[K])
    static get<K extends keyof MetadataMap>(target: any, key: K): MetadataMap[K] | undefined
    static has<K extends keyof MetadataMap>(target: any, key: K): boolean
    static merge<K extends keyof MetadataMap>(target: any, key: K, value: Partial<MetadataMap[K]>)
}
```

- `set` — Escribe un metadato en el `target` (clase o función).
- `get` — Lee un metadato previamente definido.
- `has` — Comprueba si un metadato existe.
- `merge` — Fusiona un objeto parcial con el valor existente (pattern usado por `@Roles` y `@Permissions`).

#### `METADATA_KEYS` — `src/core/metadata/keys.ts`

Cada clave es un `unique symbol`, lo que garantiza que no puedan colisionar entre sí aunque tengan el mismo nombre como string:

```typescript
const CONTROLLER: unique symbol = Symbol('controller')
const SERVICE:    unique symbol = Symbol('service')
const REPOSITORY: unique symbol = Symbol('repository')
// ... etc.
```

---

### 3.2 Decoradores del framework

#### `@Controller(basePath: string)` — Decorador de clase

**Propósito:** Marca una clase como controlador HTTP y le asigna un prefijo de ruta base.

**Comportamiento interno:**
1. Escribe `true` en el metadato `CONTROLLER` del target.
2. Escribe `basePath` en el metadato `BASE_PATH` del target.

El `CoreRouter` escanea todos los archivos `.controller.ts/js`, importa los módulos y comprueba si tienen el metadato `BASE_PATH` para reconocerlos como controladores.

```typescript
// Ejemplo de uso
@Controller('/auth')
export class AuthenticationController {
    // ...
}
// Rutas resultantes: /api/v1/auth/login, /api/v1/auth/register, etc.
```

---

#### `@Service()` — Decorador de clase

**Propósito:** Marca una clase como servicio de negocio, haciéndola inyectable por el contenedor DI.

**Comportamiento interno:** Escribe `true` en el metadato `SERVICE` del target. El `CoreContainer` verifica este metadato para validar que la clase es inyectable antes de instanciarla.

```typescript
@Service()
export class UserService {
    constructor(
        @Inject(UserRepository)
        private userRepository: UserRepository,
    ) {}
}
```

---

#### `@Repository()` — Decorador de clase

**Propósito:** Marca una clase como repositorio de acceso a datos, haciéndola inyectable.

**Comportamiento interno:** Igual que `@Service()`, escribe `true` en metadato `REPOSITORY`.

```typescript
@Repository()
export class UserRepository extends BaseRepository<User> {
    constructor() {
        super(User)  // Pasa la clase entidad al repositorio base
    }
}
```

---

#### `@Inject(dependency: new(...args) => T)` — Decorador de parámetro de constructor

**Propósito:** Indica al contenedor DI qué clase concreta debe instanciar e inyectar en una posición específica del constructor.

**Comportamiento interno:**
1. Lee el arreglo existente en el metadato `INJECT` del target (o inicializa uno vacío).
2. Escribe la clase `dependency` en la posición `index` del arreglo (correspondiente a la posición del parámetro en el constructor).
3. Persiste el arreglo actualizado.

```typescript
// Después de aplicar los decoradores, el metadato INJECT del target queda así:
// [UserRepository, RoleRepository, PermissionRepository, BlockedTokenRepository]

@Service()
export class UserService {
    constructor(
        @Inject(UserRepository)        // índice 0
        private userRepository: UserRepository,
        @Inject(RoleRepository)        // índice 1
        private roleRepository: RoleRepository,
        @Inject(PermissionRepository)  // índice 2
        private permissionRepository: PermissionRepository,
        @Inject(BlockedTokenRepository)// índice 3
        private blockedTokenRepository: BlockedTokenRepository
    ) {}
}
```

---

#### `@Get`, `@Post`, `@Put`, `@Delete`, `@Patch`, `@Head`, `@Options`, `@All` — Decoradores de método

**Propósito:** Mapean un método de un controlador a un verbo HTTP y una ruta específica.

**Implementación interna:** Todos son generados por la función auxiliar `createRouteDecorator(method)`, que escribe en el metadato `ROUTE` de la **función del método** (no de la clase) el objeto `{ method, path }`.

```typescript
// Definición interna simplificada:
const createRouteDecorator = (method: HttpMethod) => {
    return (path: string) => {
        return (target, key, descriptor: PropertyDescriptor) => {
            Metadata.set(descriptor.value, METADATA_KEYS.ROUTE, { method, path })
        }
    }
}
```

```typescript
// Ejemplo de uso:
@Get('/users')
async findAll(request, response) {
    // → GET /api/v1/auth/users
}

@Post('/register')
async register(request, response) {
    // → POST /api/v1/auth/register
}
```

---

#### `@Public()` — Decorador de método

**Propósito:** Marca una ruta como **pública**, excluyéndola de la verificación de JWT.

**Comportamiento:** Escribe `true` en el metadato `PUBLIC` de la función del método. El `RouteHandler`, antes de ejecutar el handler, comprueba si este metadato existe. Si lo hace, omite el paso de autenticación.

```typescript
@Public()
@Post('/login')
async login(request, response) {
    // Esta ruta NO requiere JWT
}

@Get('/me')
async me(request, response) {
    // Esta ruta SÍ requiere JWT (comportamiento por defecto)
}
```

---

#### `@Roles(roles: string[])` — Decorador de método

**Propósito:** Restringe el acceso a la ruta a usuarios que posean al menos uno de los roles especificados.

**Comportamiento:** Usa `Metadata.merge` para escribir `{ roles }` en el metadato `AUTH` del método. Si ya existía un metadato `AUTH` (por ejemplo, de `@Permissions`), lo fusiona con spread operator.

```typescript
@Roles(['Admin', 'SuperAdmin'])
@Get('/users')
async findAll(request, response) {
    // Solo accesible para usuarios con rol Admin o SuperAdmin
}
```

---

#### `@Permissions(permissions: string[])` — Decorador de método

**Propósito:** Restringe el acceso a usuarios que posean **todos** los permisos listados.

**Comportamiento:** Idéntico a `@Roles` pero escribe `{ permissions }` en el metadato `AUTH`. La verificación en `RouteHandler` es `every` (todos los permisos deben cumplirse) mientras que para roles es `some` (basta con tener uno).

```typescript
@Permissions([PERMISSIONS.USER.UPDATE])
@Post('/authorize/:username')
async authorize(request, response) {
    // Solo si el usuario tiene el permiso 'UpdateUsers'
}
```

---

#### `@Handler()` — Decorador de clase

**Propósito:** Marca `RouteHandler` como inyectable en el contenedor DI. Es un uso interno del framework para que el propio handler sea manejable por el sistema.

---

#### `@Middleware()` — Decorador de clase

**Propósito:** Marca una clase como middleware, haciéndola inyectable en el contenedor DI.

```typescript
@Middleware()
export class AuthMiddleware {
    constructor(
        @Inject(UserService) private userService: UserService,
        // ...
    ) {}

    async auth(request) { /* ... */ }
}
```

---

#### `@Router()` — Decorador de clase

**Propósito:** Marca el `CoreRouter` como inyectable. Es un uso interno para auto-registrar el propio enrutador en el contenedor.

---

## 4. ORM personalizado

El ORM es un sistema **ligero y declarativo** construido íntegramente sobre decoradores y `reflect-metadata`. Admite la definición de esquemas mediante anotaciones directamente en las clases de dominio, y sincroniza automáticamente el esquema SQL en PostgreSQL al arrancar la aplicación.

### 4.1 `@Entity(tableName: string)` — Decorador de clase

**Propósito:** Declara una clase como entidad persistible y la vincula a una tabla de base de datos.

**Comportamiento interno:**
1. Escribe `{ tableName }` en el metadato `ENTITY` de la clase.
2. Registra la clase en el `EntityRegistry` (un `Set<Function>` global), lo que permite al proceso de sincronización iterar sobre todas las entidades del sistema.

```typescript
@Entity('Users')
export class User {
    // ...
}
// → La clase User se mapea a la tabla "Users" de PostgreSQL
```

---

### 4.2 `@Id()` — Decorador de propiedad

**Propósito:** Marca una propiedad como clave primaria de la entidad. Implica tipo `UUID`, `NOT NULL`, `UNIQUE` y `PRIMARY KEY` con valor generado automáticamente por `gen_random_uuid()` en PostgreSQL.

**Comportamiento interno:**
1. Escribe el `propertyKey` en el metadato `ID` de la clase (para que el repositorio base sepa cuál es el campo PK).
2. Agrega la columna al mapa `COLUMNS` con la configuración `{ type: 'uuid', nullable: false, unique: true }`.

```typescript
@Entity('Users')
export class User {
    @Id()
    id: string
    // → columna "id" UUID PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL UNIQUE
}
```

---

### 4.3 `@Column(options?: Partial<ColumnConfig>)` — Decorador de propiedad

**Propósito:** Mapea una propiedad de la clase a una columna de la tabla.

**Configuración disponible (`ColumnConfig`):**

| Opción | Tipo | Descripción |
|---|---|---|
| `name` | `string` | Nombre custom de la columna (por defecto, el nombre de la propiedad) |
| `type` | `'string' \| 'number' \| 'boolean' \| 'date' \| 'uuid' \| 'text'` | Tipo de dato explícito |
| `nullable` | `boolean` | Si la columna admite `NULL` |
| `default` | `any` | Valor por defecto |
| `unique` | `boolean` | Si debe existir una restricción `UNIQUE` |

**Comportamiento interno:** Si no se proporciona `type`, el decorador lee el tipo de TypeScript mediante `Reflect.getMetadata('design:type', target, propertyKey)` (esto requiere `emitDecoratorMetadata: true` en `tsconfig.json`) y lo convierte al tipo SQL equivalente en tiempo de sincronización.

**Mapa de tipos (TypeScript → SQL):**

| TypeScript | SQL generado |
|---|---|
| `String` | `TEXT` |
| `Number` | `INTEGER` |
| `Boolean` | `BOOLEAN` |
| `Date` | `TIMESTAMP` |
| `'uuid'` | `UUID` |
| `'text'` | `TEXT` |
| `'string'` | `TEXT` |

```typescript
@Column({ type: 'string', nullable: false, unique: true })
username: string
// → "username" TEXT NOT NULL UNIQUE

@Column({ type: 'boolean', nullable: false, default: true })
isActive: boolean
// → "isActive" BOOLEAN NOT NULL DEFAULT 'true'
```

---

### 4.4 Decoradores de relaciones

Todos los decoradores de relaciones se encuentran en `src/core/orm/decorators/relations/relations.decorator.ts`.

#### `@OneToMany(targetType, optionsOrInverse?)`

**Propósito:** Define una relación uno-a-muchos. La entidad actual es el "uno" y `targetType` es el "muchos".

**Mapeo en base de datos:** No genera ninguna columna en la tabla actual. La foreignKey reside en la tabla hija (`targetType`). Al cargar la relación, ejecuta un `SELECT * FROM "TargetTable" WHERE "foreignKey" IN (...)`.

```typescript
// En User.entity.ts
@OneToMany(() => BlockedToken, 'userId')
blockedTokens: BlockedToken[]
// → Al cargar la relación, busca en "BlockedTokens" WHERE "userId" IN (ids de usuarios)
```

#### `@ManyToOne(targetType, optionsOrInverse?)`

**Propósito:** Define una relación muchos-a-uno. El "muchos" es la entidad actual. **Genera una columna FK** en la tabla actual.

**Mapeo en base de datos:** Agrega una columna `<propName>Id UUID` con una restricción `FOREIGN KEY REFERENCES "TargetTable"("targetIdField") ON DELETE SET NULL`.

| Opción | Descripción |
|---|---|
| `joinColumn` | Nombre personalizado de la columna FK (defecto: `${propName}Id`) |
| `inverse` | Nombre de la propiedad inversa en la entidad target |

#### `@OneToOne(targetType, optionsOrInverse?)`

**Propósito:** Define una relación uno-a-uno. Si no tiene `inverse`, genera una columna FK `UNIQUE` en la tabla actual. Si tiene `inverse`, actúa como el lado inverso (no genera columna).

#### `@ManyToMany(targetType, optionsOrJoinTable?, inverseProperty?)`

**Propósito:** Define una relación muchos-a-muchos. Genera (o referencia) una **tabla de unión** intermedia.

**Opciones de configuración:**

La tabla de unión puede configurarse de tres formas:
1. **String:** nombre simple de la tabla de unión.
2. **`JoinTableConfig` object:** control total del nombre y columnas.
3. **Sin configuración:** el nombre se genera automáticamente como la concatenación alfabética de ambas tablas.

```typescript
// JoinTableConfig interface
interface JoinTableConfig {
    name?: string        // Nombre de la tabla de unión
    joinColumn?: string  // Columna de la entidad actual en la tabla de unión
    inverseJoinColumn?: string // Columna de la entidad target
}
```

**Ejemplo completo (User ↔ Role):**

```typescript
// En User.entity.ts
@ManyToMany(() => Role, {
    joinTable: {
        name: "UsersRoles",
        joinColumn: "userId",
        inverseJoinColumn: "roleId"
    },
    owner: true,   // Este lado gestiona la tabla de unión
    eager: true    // La relación se carga automáticamente en cada consulta
})
roles: Role[]

// En Role.entity.ts (lado inverso)
@ManyToMany(() => User, {
    joinTable: {
        name: "UsersRoles",
        joinColumn: "roleId",
        inverseJoinColumn: "userId"
    }
})
users: User[]
```

---

### 4.5 Sincronización de esquema — `Database.sync()`

La clase `Database` implementa el **Patrón Singleton** y gestiona la conexión al pool de PostgreSQL mediante `pg`. Al arrancar la aplicación (`index.ts`), se invoca `db.sync()`, que realiza una **migración automática aditiva** en dos fases:

#### Fase 1: Sincronización de tablas y columnas

Para cada entidad registrada en `EntityRegistry`:

1. Crea la tabla si no existe (con una columna temporal `_placeholder`).
2. Consulta las columnas existentes en `information_schema.columns`.
3. Para cada columna definida en la entidad con `@Column` / `@Id`:
   - Si **no existe** en la BD, la agrega con `ALTER TABLE ... ADD COLUMN`.
   - Si **ya existe**, la omite (no hay migraciones destructivas).
4. Agrega las **columnas de auditoría** si no existen:

| Columna | Tipo | Valor por defecto |
|---|---|---|
| `status` | `TEXT` | `'Created'` |
| `isActive` | `BOOLEAN` | `TRUE` |
| `isDeleted` | `BOOLEAN` | `FALSE` |
| `createdAt` | `TIMESTAMP` | `NOW()` |
| `createdBy` | `TEXT` | `'System'` |
| `updatedAt` | `TIMESTAMP` | `NULL` |
| `updatedBy` | `TEXT` | `NULL` |
| `deletedAt` | `TIMESTAMP` | `NULL` |
| `deletedBy` | `TEXT` | `NULL` |

5. Elimina la columna `_placeholder` si existe.

#### Fase 2: Sincronización de relaciones

Itera de nuevo sobre `EntityRegistry` y, para cada relación definida:

- **`ManyToOne` y `OneToOne` (lado propietario):** Agrega la columna FK y crea la restricción `FOREIGN KEY ... ON DELETE SET NULL`.
- **`ManyToMany`:** Crea la tabla de unión con clave primaria compuesta y `FOREIGN KEY ... ON DELETE CASCADE` desde ambos lados.
- Verifica si el constraint ya existe antes de intentar crearlo para evitar errores.

> **Comportamiento conservador:** el ORM nunca elimina columnas ni tablas existentes. Las migraciones son exclusivamente aditivas.

---

### 4.6 `BaseRepository<T>` — Repositorio genérico

Clase base que provee operaciones CRUD completas. Los repositorios concretos simplemente la extienden pasando la clase entidad al constructor.

#### Interfaces de opciones

```typescript
interface FindOptions {
    relations?: boolean | string[]  // true = cargar todas; string[] = cargar solo las indicadas
}

interface QueryOptions extends FindOptions {
    where?: Record<string, any>             // Condiciones de filtrado (AND implícito)
    select?: string[]                       // Proyección de columnas
    orderBy?: { field: string, direction: 'ASC' | 'DESC' }
    limit?: number
    offset?: number
}
```

#### Métodos de consulta

| Método | Descripción |
|---|---|
| `findAll(includeDeleted?, options?)` | Devuelve todos los registros. Por defecto excluye los soft-deleted. |
| `findById(id, includeDeleted?, options?)` | Busca un registro por PK. |
| `findOneBy(field, value, includeDeleted?, options?)` | Busca el primer registro que cumpla `field = value`. |
| `findManyBy(field, value, includeDeleted?, options?)` | Devuelve todos los registros que cumplan `field = value`. |
| `query(options)` | Query flexible con filtros, proyección, ordenamiento y paginación. |
| `raw(sql, params?)` | Ejecuta SQL en crudo y devuelve las filas resultantes. |

#### Métodos de escritura

| Método | Descripción |
|---|---|
| `create(data)` | Inserta un nuevo registro. Genera el UUID automáticamente si no se provee. Sincroniza relaciones `ManyToMany` post-inserción. |
| `update(id, data)` | Actualiza un registro por PK. Rellena `updatedAt` automáticamente. Sincroniza relaciones `ManyToMany`. |
| `updateBy(field, value, data)` | Actualiza todos los registros que cumplan `field = value`. |
| `delete(id, deletedBy?)` | **Soft delete**: marca `isDeleted = TRUE` y registra `deletedAt` y `deletedBy`. |
| `deleteBy(field, value, deletedBy?)` | Soft delete masivo por campo. |
| `hardDelete(id)` | Eliminación física permanente del registro. |

#### Carga de relaciones — `loadRelations`

Método privado invocado automáticamente por todos los métodos de consulta cuando se pasan opciones de relaciones. Implementa un sistema de **carga diferida selectiva** en batch:

1. **`ManyToOne` / `OneToOne` (propietario):** Lee los FK de todos los objetos encontrados, los deduplica y hace un único `SELECT ... WHERE id IN (...)` a la tabla destino (evita el problema N+1).
2. **`OneToMany` / `OneToOne` (inverso):** Hace un `SELECT * FROM "TargetTable" WHERE "fkCol" IN (selfIds)` y asigna los resultados a cada entidad padre.
3. **`ManyToMany`:** Primero consulta la tabla de unión para obtener los ID intermedios, luego hace un `SELECT` a la tabla destino con los IDs obtenidos, y finalmente hace el join en memoria.

#### Sincronización de relaciones ManyToMany — `syncRelations`

Llamado en `create` y `update`. Implementa una **sincronización diferencial (diff-based)**:

1. Obtiene los IDs actualmente en la tabla de unión.
2. Computa los IDs que hay que **insertar** (nuevos - existentes).
3. Computa los IDs que hay que **eliminar** (existentes - nuevos).
4. Ejecuta los `DELETE` e `INSERT` necesarios.

Esto garantiza que solo se realizan las operaciones mínimas necesarias:

```typescript
// Ejemplo: User tiene roles [Admin, User]. Se actualiza a [User, Guest].
// → Se elimina la fila (userId, adminRoleId) de UsersRoles
// → Se inserta la fila (userId, guestRoleId) en UsersRoles
// → La fila (userId, userRoleId) permanece intacta
```

---

## 5. Contenedor de dependencias

### `CoreContainer` — `src/core/container/Core.container.ts`

Implementa un **contenedor DI con patrón Singleton** para cada clase registrada. Los pasos del proceso de resolución son:

1. **Cache check:** Si la clase ya fue instanciada, devuelve la instancia existente del `Map`.
2. **Validación:** Verifica que la clase tenga al menos uno de los metadatos marcadores (`@Service`, `@Controller`, `@Repository`, `@Router`, `@Handler`, `@Middleware`). Si no, lanza un error.
3. **Resolución de dependencias:** Lee el arreglo del metadato `INJECT`. Para cada elemento (clase dependencia), llama recursivamente a `CoreContainer.get(dependency)`, lo que resuelve el árbol completo de dependencias.
4. **Instanciación:** Crea la instancia con `new target(...dependencies)`.
5. **Registro:** Almacena la instancia en el `Map` para futuras solicitudes.

```
CoreContainer.get(AuthMiddleware)
  └── CoreContainer.get(UserService)
        └── CoreContainer.get(UserRepository) → new UserRepository()   [Singleton]
        └── CoreContainer.get(RoleRepository) → new RoleRepository()   [Singleton]
        └── ...
  └── CoreContainer.get(RoleService)
        └── CoreContainer.get(RoleRepository) → cached [Singleton]
  └── ...
→ new AuthMiddleware(userService, roleService, permissionService, blockedTokenService)
```

> Dado que el Map persiste durante todo el ciclo de vida de la aplicación y cada clase solo se instancia una vez, todas las instancias son efectivamente **Singletons**.

---

## 6. Sistema de enrutamiento

### `CoreRouter` — `src/core/router/Core.router.ts`

El enrutador implementa **auto-descubrimiento de controladores** al arrancar la aplicación:

1. **Escaneo del sistema de archivos** (`scan`): recorre recursivamente el directorio `src/` buscando archivos con sufijo `.controller.ts` o `.controller.js`.
2. **Importación dinámica:** Importa cada archivo encontrado con `import()` dinámico usando `pathToFileURL`.
3. **Detección de controladores:** Para cada export del módulo, verifica si tiene el metadato `BASE_PATH`. Si lo tiene, es un controlador válido.
4. **Registro de rutas** (`register`): 
   - Obtiene la instancia del controlador desde `CoreContainer`.
   - Itera sobre todos los métodos del prototipo de la clase.
   - Para cada método que tenga el metadato `ROUTE`, crea un `RouteHandler` y lo registra en Express: `app[httpMethod](prefix + basePath + path, handler.execute)`.

No es necesario registrar controladores manualmente en ningún archivo de configuración; basta con crear el archivo siguiendo la convención de nomenclatura.

---

## 7. Middlewares

### `AuthMiddleware` — `src/core/middlewares/Auth.middleware.ts`

Middleware encargado de autenticar las solicitudes entrantes. Es invocado por `RouteHandler` en cada petición a rutas no marcadas con `@Public()`.

**Flujo de autenticación:**

```
1. Extrae el token del header Authorization o de la cookie accessToken
2. Si no hay token → TokenRequiredError (401)
3. Verifica si el token está en la lista negra (BlockedToken) → UnauthorizedError
4. Verifica y decodifica el JWT con jwt.verify(token, JWT_SECRET)
5. Carga roles activos del usuario desde la BD
6. Carga permisos activos del usuario desde la BD
7. Carga datos del usuario desde la BD
8. Valida estado del usuario: isAuthorized, !isDeleted, isActive
9. Adjunta request.user = new UserDTO(user) con roles y permissions
```

### `ErrorMiddleware` — `src/core/middlewares/Error.middleware.ts`

Manejador global de errores de Express (4 parámetros). Intercepta todos los errores propagados con `next(err)`:

- Si el error es instancia de `HandleableError` (errores de negocio controlados): responde con `error.status` y el JSON serializado del error.
- Si es cualquier otro error (errores inesperados): responde con `500 Internal Server Error`.

---

## 8. Gestión de errores

El sistema implementa una jerarquía de errores tipados que extienden `HandleableError`:

```
Error (nativo)
└── HandleableError        → código, status, tipo (toJSON serializable)
    ├── NotFoundError          401 → NOT_FOUND
    ├── UnauthorizedError      401 → UNAUTHORIZED
    ├── ForbiddenError         403 → FORBIDDEN
    ├── InvalidCredentialError 400 → INVALID_CREDENTIALS
    ├── InvalidFormatError     400 → INVALID_FORMAT
    ├── AlreadyExistError      409 → ALREADY_EXIST
    ├── NotImplementedError    501 → NOT_IMPLEMENTED
    └── TokenRequiredError     401 → TOKEN_REQUIRED
```

**Formato de respuesta de error:**

```json
{
    "code": "NOT_FOUND",
    "message": "El usuario no existe",
    "status": 404,
    "type": "NotFoundError"
}
```

---

## 9. Módulo de autenticación y autorización

### Entidades

#### `User`

| Propiedad | Tipo | Restricciones |
|---|---|---|
| `id` | UUID | PK, auto-generado |
| `name` | TEXT | NOT NULL |
| `username` | TEXT | NOT NULL, UNIQUE |
| `documentType` | TEXT | — |
| `documentNumber` | TEXT | — |
| `gender` | TEXT | — |
| `country` | TEXT | — |
| `city` | TEXT | — |
| `address` | TEXT | — |
| `phoneNumber` | TEXT | — |
| `email` | TEXT | NOT NULL, UNIQUE |
| `password` | TEXT | NOT NULL (hash bcrypt) |
| `birthdate` | TIMESTAMP | — |
| `image` | TEXT | URL |
| `registerDate` | TIMESTAMP | — |
| `lastLogin` | TIMESTAMP | — |
| `isAuthorized` | BOOLEAN | NOT NULL, DEFAULT TRUE |
| `isOnline` | BOOLEAN | NOT NULL, DEFAULT FALSE |
| `isActive` | BOOLEAN | NOT NULL, DEFAULT TRUE |
| `isDeleted` | BOOLEAN | NOT NULL, DEFAULT FALSE |

**Relaciones:**
- `@OneToMany(() => BlockedToken, 'userId')`: Tokens bloqueados del usuario.
- `@ManyToMany(() => Role, ...)` con tabla de unión `UsersRoles`: Roles asignados.

#### `Role`

Campos: `id`, `name`, `alias`, `description`, `isActive`, `isDeleted`.

**Relaciones:**
- `@ManyToMany(() => Permission, ...)` con tabla `RolesPermissions`.
- `@ManyToMany(() => User, ...)` con tabla `UsersRoles` (lado inverso).

#### `Permission`

Campos: `id`, `name`, `alias`, `description`, `type`, `isActive`, `isDeleted`.

**Relaciones:**
- `@ManyToMany(() => Role, ...)` con tabla `RolesPermissions` (lado inverso).

#### `BlockedToken`

Almacena los tokens JWT revocados (lista negra para logout).

### Endpoints implementados

| Método | Ruta | Acceso | Descripción |
|---|---|---|---|
| POST | `/api/v1/auth/register` | Público | Registro de nuevo usuario |
| POST | `/api/v1/auth/login` | Público | Login y emisión de JWT |
| POST | `/api/v1/auth/logout` | Autenticado | Revocación del token |
| GET | `/api/v1/auth/me` | Autenticado | Datos del usuario en sesión |
| PATCH | `/api/v1/auth/modify` | Autenticado | Actualización de perfil |
| PATCH | `/api/v1/auth/reset` | Autenticado | Cambio de contraseña |
| GET | `/api/v1/auth/session` | Autenticado | Datos de la sesión activa |
| GET | `/api/v1/auth/session/roles` | Autenticado | Roles del usuario en sesión |
| GET | `/api/v1/auth/session/permissions` | Autenticado | Permisos del usuario en sesión |
| POST | `/api/v1/auth/authorize/:username` | `UpdateUsers` | Autorizar usuario |
| POST | `/api/v1/auth/disauthorize/:username` | `UpdateUsers` | Desautorizar usuario |

### Datos semilla (`init.sql`)

El script de inicialización provee los datos base del sistema:

- **3 roles:** `Guest`, `User`, `Admin`
- **23 permisos** categorizados por tipo (`Read`, `Create`, `Update`, `Delete`, `Assign`, `Check`, `Revoke`, `Access`)
- El rol `Admin` recibe todos los permisos del sistema

---

## 10. Patrones de diseño

| Patrón | Ubicación | Descripción |
|---|---|---|
| **Repository Pattern** | `BaseRepository<T>` + repositorios concretos | Abstrae el acceso a datos detrás de una interfaz consistente. Los servicios no conocen SQL; solo interactúan con métodos del repositorio. |
| **Dependency Injection (DI)** | `CoreContainer` + `@Inject` | Gestión automática del grafo de dependencias. Las clases declaran sus necesidades mediante decoradores y el contenedor las satisface en tiempo de ejecución. |
| **Singleton** | `CoreContainer` (todas las instancias), `Database` | Cada clase inyectable y la conexión a BD se instancian una única vez durante el ciclo de vida de la aplicación. |
| **Decorator Pattern** | Todo el sistema de metadatos | Los decoradores enriquecen clases y métodos con metadatos que son leídos por el framework para configurar comportamiento (rutas, inyección, ORM). |
| **Template Method** | `BaseRepository<T>` | Define el esqueleto de las operaciones CRUD. Los repositorios concretos heredan el comportamiento y pueden añadir métodos específicos (e.g., `findManyByUserId`). |
| **Chain of Responsibility** | Express middlewares → `RouteHandler` → handler | Las solicitudes pasan por una cadena de procesamiento: middleware de auth → verificación de roles/permisos → handler del controlador → middleware de errores. |
| **Registry** | `EntityRegistry` | Un `Set` global que actúa como registro centralizado de todas las entidades del sistema, utilizado por la fase de sincronización del ORM. |
| **Layered Architecture** | `Controller → Service → Repository → Entity` | Separación estricta de responsabilidades en capas: presentación, lógica de negocio, acceso a datos y modelo de dominio. |

---

## 11. Variables de entorno

El archivo `.env` debe ubicarse en la raíz de `/api`.

| Variable | Ejemplo | Descripción |
|---|---|---|
| `APP_NAME` | `Bitfive DevOps Project API` | Nombre de la aplicación (mostrado en logs) |
| `VERSION` | `1.0.0` | Versión de la API |
| `VERSIONING` | `/api/v1` | Prefijo global de versión para todas las rutas |
| `PORT` | `3000` | Puerto en el que escucha el servidor HTTP |
| `DB_HOST` | `localhost` | Host del servidor PostgreSQL |
| `DB_PORT` | `5432` | Puerto de PostgreSQL |
| `DB_USER` | `postgres` | Usuario de PostgreSQL |
| `DB_PASSWORD` | `root` | Contraseña de PostgreSQL |
| `DB_NAME` | `bitfive` | Nombre de la base de datos |
| `JWT_SECRET` | `<cadena-aleatoria-larga>` | Clave secreta para firmar y verificar tokens JWT |
| `JWT_EXPIRES_IN` | `30d` | Duración del token JWT (formato de `jsonwebtoken`) |

**Archivo `.env` de ejemplo:**

```env
APP_NAME=Bitfive DevOps Project API
VERSION=1.0.0
VERSIONING=/api/v1
PORT=3000

DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=tu_contraseña_aqui
DB_NAME=bitfive

JWT_SECRET=cambia-esto-por-una-cadena-muy-larga-y-aleatoria
JWT_EXPIRES_IN=30d
```

> ⚠️ **Nunca incluyas el archivo `.env` real en el repositorio.** El archivo `DATABASE_URL` presente en el `.env` actual parece ser un artefacto de configuración alternativa y no es utilizado por el código activo.

---

## 12. Instalación y ejecución

### Prerrequisitos

- Node.js ≥ 20 LTS
- PostgreSQL ≥ 14 corriendo y accesible

### Instalación

```bash
cd api
npm install
```

### Configurar variables de entorno

```bash
cp .env.example .env
# Editar .env con los valores correctos
```

### Iniciar en modo desarrollo

```bash
npm run dev
```

> Usa `tsx watch` para hot-reload automático. La aplicación realizará la sincronización del esquema de BD al arrancar y registrará todos los controladores encontrados.

### Inicializar datos semilla

Una vez que el servidor haya arrancado y sincronizado el schema, ejecutar el script de inicialización de datos:

```sql
-- Conectarse a la BD y ejecutar:
\i src/core/orm/database/scripts/init.sql
```

### Compilar para producción

```bash
npm run build
# Output en ./dist/
```

### Iniciar en modo producción

```bash
npm start
# Requiere haber ejecutado npm run build previamente
```

### Resumen de scripts

| Comando | Descripción |
|---|---|
| `npm run dev` | Servidor de desarrollo con hot-reload (`tsx watch`) |
| `npm run build` | Compilación TypeScript → JavaScript en `./dist` |
| `npm start` | Ejecuta el bundle compilado con Node.js |
# App — Bitfive DevOps Project

> Frontend del proyecto Bitfive, construido con **Vite** y **React 18**. Implementa un panel de administración con autenticación JWT, gestión de roles y permisos, y una arquitectura de componentes organizada según los principios de **Screaming Architecture**.

---

## Tabla de contenidos

1. [Stack tecnológico](#1-stack-tecnológico)
2. [Arquitectura y estructura de directorios](#2-arquitectura-y-estructura-de-directorios)
3. [Punto de entrada y configuración de rutas](#3-punto-de-entrada-y-configuración-de-rutas)
4. [Sistema de contextos (estado global)](#4-sistema-de-contextos-estado-global)
5. [Capa de servicios y comunicación con el backend](#5-capa-de-servicios-y-comunicación-con-el-backend)
6. [Hooks personalizados](#6-hooks-personalizados)
7. [Biblioteca de componentes reutilizables](#7-biblioteca-de-componentes-reutilizables)
8. [Módulos de la aplicación](#8-módulos-de-la-aplicación)
9. [Variables de entorno](#9-variables-de-entorno)
10. [Instalación y ejecución](#10-instalación-y-ejecución)

---

## 1. Stack tecnológico

| Tecnología | Versión | Rol |
|---|---|---|
| **Vite** | ^6.3.5 | Bundler y servidor de desarrollo |
| **React** | ^18.3.1 | Biblioteca de UI |
| **React DOM** | ^18.3.1 | Renderizado al DOM |
| **React Router DOM** | ^6.28.0 | Enrutamiento del lado del cliente (SPA) |
| **Firebase SDK** | ^12.0.0 | Auth Firebase, Realtime Database y Storage para archivos |
| **Recharts** | ^3.7.0 | Gráficos y visualizaciones del dashboard |
| **ExcelJS** | ^4.4.0 | Generación de reportes en formato Excel |
| **Leaflet / React Leaflet** | ^1.9.4 / ^4.2.1 | Mapas interactivos |

---

## 2. Arquitectura y estructura de directorios

La aplicación sigue los principios de **Screaming Architecture**: la estructura de carpetas refleja claramente las capacidades y dominios del sistema, no los patrones técnicos. Un desarrollador puede identificar de inmediato para qué sirve la aplicación leyendo los nombres de los directorios.

```
app/
├── public/                    ← Assets estáticos servidos directamente
├── index.html                 ← HTML shell de la SPA
├── vite.config.js             ← Configuración de Vite y proxy de desarrollo
└── src/
    ├── main.jsx               ← Punto de entrada: providers + routing
    ├── assets/                ← Imágenes, iconos y otros recursos estáticos
    ├── core/                  ← Infraestructura transversal reutilizable
    │   ├── components/        ← Biblioteca de componentes UI genéricos
    │   │   ├── AlertMessage/
    │   │   ├── Brand/
    │   │   ├── Button/
    │   │   ├── ButtonGroup/
    │   │   ├── Card3D/
    │   │   ├── ConnectionWrapper/
    │   │   ├── Context3D/
    │   │   ├── Divider/
    │   │   ├── Dropdown/
    │   │   ├── Empity/
    │   │   ├── Expandable/
    │   │   ├── Footer/
    │   │   ├── Icon/
    │   │   ├── ImageUploader/
    │   │   ├── Input/
    │   │   ├── InputGroup/
    │   │   ├── InputSearch/
    │   │   ├── Loader/
    │   │   ├── Logo/
    │   │   ├── MapPicker/
    │   │   ├── Modal/
    │   │   ├── Notification/
    │   │   ├── Notifications/
    │   │   ├── Password/
    │   │   ├── ProtectedRoute/  ← Guardia de rutas con RBAC
    │   │   ├── Select/
    │   │   ├── StatusTag/
    │   │   ├── Switch/
    │   │   ├── TabGroup/
    │   │   ├── Table/
    │   │   ├── Textarea/
    │   │   └── Tooltip/
    │   ├── config/
    │   │   ├── api.config.mjs      ← URLs base y endpoints agrupados de la API REST
    │   │   └── firebase.config.mjs ← Inicialización del SDK de Firebase
    │   ├── constants/              ← Constantes globales de la aplicación
    │   ├── contexts/               ← Estado global mediante React Context API
    │   │   ├── AuthContext.jsx       ← Sesión del usuario, login, logout, RBAC
    │   │   ├── ThemeContext.jsx      ← Tema claro/oscuro/sistema
    │   │   └── NotificationContext.jsx ← Sistema de notificaciones toast
    │   ├── hooks/                  ← Hooks React reutilizables
    │   │   ├── useForm.jsx
    │   │   ├── useLoad.jsx
    │   │   ├── useLocalStorange.jsx
    │   │   ├── useQueryParams.jsx
    │   │   ├── useSync.jsx
    │   │   └── useTheme.jsx
    │   ├── lib/                    ← Utilidades de bajo nivel (notify, etc.)
    │   ├── pages/                  ← Páginas del core (páginas de error)
    │   │   ├── App/                  ← Componente raíz de la aplicación
    │   │   ├── Help/
    │   │   ├── NotFound/             ← Página 404
    │   │   ├── Offline/              ← Página sin conexión
    │   │   ├── Policies/             ← Políticas de uso
    │   │   ├── Unauthorized/         ← Página 403
    │   │   └── UnderConstruction/    ← Página en construcción
    │   ├── scripts/                ← Scripts de utilidad frontend
    │   ├── services/
    │   │   └── service/
    │   │       ├── Service.mjs       ← Wrapper de Firebase (Auth, Database, Storage)
    │   │       └── Requester.mjs     ← Cliente HTTP con token, timeout, parsing
    │   ├── styles/
    │   │   └── global.css            ← Variables CSS, reset y estilos globales
    │   └── utils/                  ← Funciones utilitarias puras
    └── modules/                   ← Módulos de funcionalidad por dominio
        ├── auth/                   ← Módulo de autenticación del usuario
        │   ├── Authentication.jsx    ← Contenedor con lógica de flujo login/registro
        │   ├── Authentication.css
        │   ├── LoginForm.jsx         ← Formulario de inicio de sesión
        │   ├── LoginForm.css
        │   ├── RegisterForm.jsx      ← Formulario de registro de cuenta
        │   ├── RegisterForm.css
        │   └── constants/
        └── panel/                  ← Módulo del panel de administración
            ├── assets/
            ├── components/           ← Componentes específicos del panel
            │   ├── Permissions/
            │   ├── Roles/
            │   └── ...
            ├── config/
            │   └── panel.config.jsx  ← Menú, rutas y authorities del panel
            ├── constants/
            ├── contexts/
            ├── hooks/
            ├── layouts/
            │   └── PanelLayout/      ← Estructura visual del panel (sidebar, header)
            ├── lib/
            ├── pages/                ← Vistas del panel de administración
            │   ├── Dashboard/
            │   ├── Authorization/
            │   └── Users/
            ├── scripts/
            ├── services/             ← Servicios HTTP del módulo panel
            ├── styles/
            └── utils/
```

### Convenciones de nomenclatura

| Tipo | Convención | Ejemplo |
|---|---|---|
| Componentes React | PascalCase | `ProtectedRoute.jsx` |
| Hooks | camelCase con prefijo `use` | `useSync.jsx` |
| Contextos | PascalCase con sufijo `Context` | `AuthContext.jsx` |
| Servicios/Utilidades | PascalCase con extensión `.mjs` | `Requester.mjs` |
| Módulos de dominio | camelCase | `auth/`, `panel/` |
| Archivos de configuración | camelCase con sufijo `.config` | `api.config.mjs` |
| Estilos | Mismo nombre que el componente | `LoginForm.css` |

---

## 3. Punto de entrada y configuración de rutas

### `main.jsx`

Es el punto de arranque de la aplicación. Realiza las siguientes tareas en orden:

1. **Importa los estilos globales** (`global.css`).
2. **Envuelve la aplicación** en una jerarquía de providers anidados:

```
<StrictMode>
  <App>                          ← Componente raíz (estilos base, theming)
    <AuthProvider>               ← Gestión de sesión JWT
      <ThemeProvider>            ← Gestión del tema visual
        <NotificationProvider>   ← Sistema de notificaciones toast
          <BrowserRouter>        ← Enrutamiento del lado del cliente
            <Routes>
              ...
```

3. **Configura el árbol de rutas** de forma declarativa:

```jsx
// Ruta pública de autenticación
<Route path='/auth' element={<Authentication />} />

// Rutas protegidas del panel (requieren estar autenticado)
<Route path='/' element={
    <ProtectedRoute authorities={AUTHORITIES.PANEL}>
        <PanelLayout menu={MENU} />
    </ProtectedRoute>
}>
    {/* Rutas del menú principal (generadas dinámicamente desde panel.config) */}
    {MENU.map(item => (
        <Route path={item.path} element={
            <ProtectedRoute authorities={item.authorities}>
                {item.element}
            </ProtectedRoute>
        } />
    ))}
    {/* Sub-rutas del menú (items anidados) */}
    {MENU.flatMap(item => (item.items || []).map(subItem => ...))}
</Route>
```

### `panel.config.jsx` — Configuración declarativa del panel

Define el menú de navegación y las rutas del panel de administración como un array de objetos. Cada item del menú contiene:

| Campo | Tipo | Descripción |
|---|---|---|
| `label` | `string` | Texto de la opción de menú |
| `icon` | `string` | Icono (Material Symbols) |
| `description` | `string` | Texto descriptivo |
| `to` | `string` | Path de navegación (usado en `<Link>`) |
| `path` | `string` | Pattern de ruta para React Router (puede incluir params como `:userId?`) |
| `element` | `ReactElement` | Componente JSX a renderizar |
| `authorities` | `{ roles?, permissions? }` | Restricciones de acceso RBAC |
| `items` | `array` | Sub-menú con la misma estructura |

```jsx
export const MENU = [
    {
        label: 'Dashboard',
        icon: 'dashboard',
        to: '',
        path: '',
        isBase: true,
        element: <Dashboard />,
        authorities: { permissions: ['AccessDashboard'] }
    },
    {
        label: 'Autorizaciones',
        icon: 'shield_toggle',
        to: 'authorization',
        path: 'authorization',
        element: <Authorization />,
        authorities: { permissions: ['AccessAuthorization'] }
    },
    // ...
]
```

Esta arquitectura permite añadir nuevas secciones al panel simplemente agregando un item al array, sin modificar el código de routing ni del layout.

### `ProtectedRoute` — Guardia de rutas

Componente que actúa como guardia de acceso. Verifica si el usuario en sesión posee las `authorities` requeridas mediante la función `hasAuthorities` del `AuthContext`. Si no tiene acceso, redirige a la página correspondiente (login o unauthorized).

---

## 4. Sistema de contextos (estado global)

La aplicación gestiona el estado global mediante la **Context API de React** con el patrón Provider/Consumer. Los tres contextos cubren las tres necesidades transversales de la aplicación.

### `AuthContext` — `src/core/contexts/AuthContext.jsx`

Es el contexto más importante de la aplicación. Gestiona el estado de autenticación del usuario y lo pone a disposición de toda la jerarquía de componentes.

**Estado:**

| Campo | Tipo | Descripción |
|---|---|---|
| `session` | `{ token: string, user: object } \| null` | Sesión activa persistida en `localStorage` |
| `user` | `object` | Shortcut a `session.user` (datos del usuario autenticado) |

**Métodos expuestos:**

| Método | Descripción |
|---|---|
| `signIn({ username, password })` | Realiza POST a `/auth/login`, persiste la sesión en `localStorage` y actualiza el estado. |
| `signUp(userData)` | Sube la imagen de perfil a Firebase Storage y realiza POST a `/auth/register`. |
| `signOut()` | Realiza POST a `/auth/logout` con el token actual, limpia `localStorage` y resetea el estado. |
| `validateSession()` | Al montar el provider, verifica si el token almacenado sigue siendo válido consultando `GET /auth/session`. |
| `hasAuthorities(session, authorities)` | Función de verificación de RBAC. Comprueba si el usuario tiene los roles/permisos requeridos. |

**Hook de acceso:**

```jsx
import { useAuth } from '../contexts/AuthContext'

const { session, user, signIn, signOut, hasAuthorities } = useAuth()
```

**Lógica de `hasAuthorities`:**

```javascript
// Para roles: el usuario debe tener AL MENOS UNO de los roles requeridos (OR)
const hasRoles = roles.length > 0
    ? roles.some(role => userRoles.includes(role))
    : true   // Sin restricción de rol → acceso permitido

// Para permisos: el usuario debe tener TODOS los permisos requeridos (AND)
const hasPermissions = permissions.every(permission =>
    userPermissions.includes(permission)
)

return hasRoles && hasPermissions
```

---

### `ThemeContext` — `src/core/contexts/ThemeContext.jsx`

Gestiona el tema visual de la aplicación con soporte para tres modos:

| Modo | Descripción |
|---|---|
| `'light'` | Tema claro forzado |
| `'dark'` | Tema oscuro forzado |
| `'system'` | Sigue la preferencia del sistema operativo del usuario |

**Implementación técnica:**
- Persiste la preferencia del usuario en `localStorage` bajo la clave `theme-preference`.
- El tema efectivo se aplica mediante el atributo `data-theme` en el elemento `<html>`.
- Escucha el evento `MediaQueryList.change` de `(prefers-color-scheme: dark)` para reaccionar automáticamente a cambios del sistema cuando el modo es `'system'`.

**API:**

```jsx
import { useContext } from 'react'
import { ThemeContext } from '../contexts/ThemeContext'

const { theme, userPreference, setThemePreference } = useContext(ThemeContext)

// Cambiar a tema oscuro forzado:
setThemePreference('dark')
```

---

### `NotificationContext` — `src/core/contexts/NotificationContext.jsx`

Gestiona el sistema de notificaciones de tipo toast que se muestran globalmente en la interfaz.

---

## 5. Capa de servicios y comunicación con el backend

La comunicación con el backend está organizada en dos niveles.

### `Requester` — `src/core/services/service/Requester.mjs`

**Cliente HTTP de bajo nivel.** Clase estática que encapsula toda la lógica de las peticiones HTTP:

**Funcionalidades:**

- **Gestión de token:** Lee el JWT desde `localStorage` e inyecta automáticamente la cabecera `Authorization` en cada petición autenticada.
- **Serialización:** Serializa automáticamente objetos a JSON o deja el cuerpo como está si es `FormData` o `rawBody`.
- **Query params:** Construye la query string a partir de un objeto, ignorando valores `null`, `undefined` y cadenas vacías.
- **Timeout:** Usa `AbortController` para cancelar peticiones que superen el tiempo configurado.
- **Parsing de respuesta:** Detecta el `Content-Type` de la respuesta y parsea automáticamente a JSON o texto.
- **Respuesta normalizada:** Todos los métodos devuelven un objeto estandarizado:

```javascript
// Respuesta exitosa:
{
    ok: true,
    status: 200,
    data: <payload de la respuesta>,
    message: <mensaje si lo hay>,
    method: 'POST',
    url: 'http://...',
    timestamp: '2026-04-12T14:00:00.000Z'
}

// Respuesta con error:
{
    ok: false,
    status: 404,
    data: null,
    message: 'El usuario no existe',
    error: <body completo del error>,
    method: 'GET',
    url: 'http://...',
    timestamp: '2026-04-12T14:00:00.000Z'
}
```

**Métodos disponibles:**

```javascript
Requester.get(url, opts)           // GET
Requester.post(url, data, opts)    // POST
Requester.put(url, data, opts)     // PUT
Requester.patch(url, data, opts)   // PATCH
Requester.delete(url, opts)        // DELETE
```

---

### `Service` — `src/core/services/service/Service.mjs`

**Wrapper de Firebase.** Clase estática que provee acceso a las capacidades de Firebase que usa la aplicación:

| Área | Métodos | Descripción |
|---|---|---|
| **Auth** | `signUp`, `signIn`, `signOut`, `getSignedUser`, `updateSignedUser`, `onSignChanged`, `singInWithGoogle` | Gestión de autenticación con Firebase Auth |
| **Realtime Database** | `setData`, `getData`, `removeData`, `updateData`, `onGetData`, `getDataPaged` | CRUD sobre Firebase Realtime Database |
| **Storage** | `uploadFile`, `deleteFile` | Subida y eliminación de archivos en Firebase Storage |

> **Nota:** La autenticación principal de la aplicación con el backend REST se realiza mediante el `AuthContext` (usando la API REST del backend), no con Firebase Auth. `Service.mjs` se usa principalmente para la **subida de archivos** (imágenes de perfil de usuarios) a Firebase Storage, cuya URL pública se envía posteriormente al backend.

---

### `api.config.mjs` — Registro de endpoints

Define de forma centralizada las URLs de todos los endpoints de la API REST. Usa la clase auxiliar `EndpointGroup` para agrupar endpoints bajo una misma base:

```javascript
export const API = {
    AUTH: new EndpointGroup(`${URL_BASE}/auth`, {
        SIGNIN: 'login',          // → http://localhost:3000/api/v1/auth/login
        SIGNOUT: 'logout',
        SIGNUP: 'register',
        SESSION: 'session',
        ROLES: 'roles',
        // ...
    })
}
```

La variable `IS_DEV_MODE` determina si se usa la URL del servidor local (`localhost:3000`) o la URL de producción.

---

### Proxy de desarrollo Vite

El archivo `vite.config.js` configura un proxy que redirige las peticiones a `/api` al servidor remoto de producción (`https://rewear.azurewebsites.net`). Esto es útil cuando el frontend necesita consumir datos del servidor en producción sin cambiar la configuración de `api.config.mjs`.

```javascript
server: {
    proxy: {
        '/api': {
            target: 'https://rewear.azurewebsites.net',
            changeOrigin: true,
            rewrite: (path) => path.replace(/^\/api/, '')
        }
    }
}
```

---

## 6. Hooks personalizados

Los hooks de `src/core/hooks/` encapsulan lógica de estado reutilizable:

### `useSync(initial?)`

**Propósito:** Gestiona listas de entidades (arrays) con operaciones CRUD en memoria. Especialmente útil para actualizar la interfaz optimísticamente sin recargar datos del servidor.

```jsx
const { state, init, sync } = useSync([])

// Cargar datos iniciales
useEffect(() => {
    fetchUsers().then(init)
}, [])

// Agregar un elemento
sync(newUser, 'create')

// Actualizar un elemento (por id)
sync(updatedUser, 'update')

// Eliminar un elemento (por id)
sync({ id: userId }, 'delete')
```

Las tres acciones son:
- `'create'` — Agrega el item al array si no existe uno con el mismo `id`.
- `'update'` — Reemplaza el item con el mismo `id` (merge con spread `{ ...r, ...item }`).
- `'delete'` — Filtra el item con el mismo `id`.

---

### `useLoad()`

**Propósito:** Encapsula el patrón de carga asíncrona (loading state). Simplifica el manejo del estado `loading` en operaciones asíncronas.

---

### `useForm()`

**Propósito:** Gestión simplificada del estado de formularios React. Mantiene el estado de los campos del formulario en un único objeto.

---

### `useQueryParams()`

**Propósito:** Lectura y escritura de parámetros de la URL (query string). Permite mantener el estado de filtros y paginación en la URL para que sean compartibles y persistentes tras recargar la página.

---

### `useLocalStorage()`

**Propósito:** Estado React sincronizado con `localStorage`. El estado se persiste automáticamente al cambiar y se recupera al montar el componente.

---

### `useTheme()`

**Propósito:** Shortcut para acceder al `ThemeContext` sin necesidad de importar `useContext` y `ThemeContext` directamente.

```jsx
const { theme, setThemePreference } = useTheme()
```

---

## 7. Biblioteca de componentes reutilizables

Todos los componentes en `src/core/components/` son genéricos y **no tienen dependencias de dominio**. Pueden usarse en cualquier módulo de la aplicación.

| Componente | Descripción |
|---|---|
| `AlertMessage` | Mensajes de alerta informativos, de éxito, advertencia o error |
| `Brand` | Logotipo e identidad visual de la marca |
| `Button` | Botón con variantes de estilo (primary, secondary, ghost, danger) |
| `ButtonGroup` | Agrupación visual de múltiples botones |
| `Card3D` | Tarjeta con efecto de perspectiva 3D al hacer hover |
| `ConnectionWrapper` | Detecta el estado de la conexión a internet y muestra la página Offline |
| `Context3D` | Contenedor para efectos 3D con perspectiva aplicada al contexto |
| `Divider` | Separador visual horizontal o vertical |
| `Dropdown` | Menú desplegable (select personalizado o menú contextual) |
| `Empity` | Estado vacío (empty state) para listas o secciones sin datos |
| `Expandable` | Sección expansible/colapsable (acordeón) |
| `Footer` | Pie de página de la aplicación |
| `Icon` | Renderiza iconos de Material Symbols |
| `ImageUploader` | Componente para seleccionar y previsualizar imágenes antes de subirlas |
| `Input` | Campo de texto con soporte para etiquetas, mensajes de error y variantes |
| `InputGroup` | Agrupación de inputs con etiqueta común |
| `InputSearch` | Input específico para búsquedas con debounce integrado |
| `Loader` | Spinner o indicador de carga |
| `Logo` | Logotipo de la aplicación |
| `MapPicker` | Mapa interactivo (Leaflet) para seleccionar coordenadas geográficas |
| `Modal` | Diálogo modal con portal React |
| `Notification` | Una notificación toast individual |
| `Notifications` | Contenedor que renderiza todas las notificaciones activas |
| `Password` | Input de contraseña con toggle de visibilidad |
| `ProtectedRoute` | Guardia de rutas basada en roles y permisos |
| `Select` | Select estilizado con soporte para opciones dinámicas |
| `StatusTag` | Etiqueta visual de estado (activo, inactivo, eliminado, etc.) |
| `Switch` | Toggle switch (checkbox alternativo) |
| `TabGroup` | Navegación por pestañas |
| `Table` | Tabla de datos con soporte para ordenamiento y acciones |
| `Textarea` | Área de texto multilínea estilizada |
| `Tooltip` | Información emergente al hacer hover sobre un elemento |

---

## 8. Módulos de la aplicación

### Módulo `auth` — `src/modules/auth/`

Gestiona el flujo de autenticación del usuario final.

**Componentes:**

- **`Authentication.jsx`:** Componente contenedor que decide si mostrar el formulario de login o el de registro, basándose en un estado de navegación interna. Si el usuario ya tiene una sesión activa, redirige al panel.

- **`LoginForm.jsx`:** Formulario de inicio de sesión. Utiliza el método `signIn` del `AuthContext`. Incluye validación de campos en el cliente antes de enviar la petición.

- **`RegisterForm.jsx`:** Formulario de registro completo. Incluye campos para información personal, documental y credenciales. Maneja la subida de imagen de perfil a Firebase Storage mediante `Service.uploadFile` antes de llamar a `signUp`.

---

### Módulo `panel` — `src/modules/panel/`

Panel de administración principal de la aplicación.

#### `panel.config.jsx`

Define el menú de navegación y las autoridades requeridas para acceder a cada sección. Las páginas disponibles actualmente son:

| Sección | Ruta | Permiso requerido |
|---|---|---|
| Dashboard | `/` (índice) | `AccessDashboard` |
| Autorizaciones | `/authorization` | `AccessAuthorization` |
| Usuarios | `/users/:userId?` | `AccessUsers` |

#### `PanelLayout`

Layout principal del panel. Recibe el `MENU` como prop y renderiza la estructura visual de la aplicación (sidebar, header, área de contenido). Utiliza `<Outlet />` de React Router para renderizar la página activa.

#### Páginas

- **`Dashboard`:** Panel principal con visualizaciones generales del sistema (implementa Recharts para gráficos).

- **`Authorization`:** Permite gestionar:
  - Roles del sistema (crear, editar, activar/desactivar)
  - Permisos del sistema (crear, editar, activar/desactivar)
  - Asignación de permisos a roles
  - Asignación/revocación de roles a usuarios

- **`Users`:** Vista de gestión de usuarios. Permite ver el listado de usuarios, autorizar/desautorizar cuentas y gestionar sus roles. Soporta navegación por ID de usuario mediante el parámetro de ruta `:userId?`.

---

## 9. Variables de entorno

Actualmente la aplicación **no utiliza variables de entorno de Vite** (no hay archivo `.env` con prefijo `VITE_`). La configuración se gestiona directamente en el archivo `src/core/config/api.config.mjs`:

```javascript
// src/core/config/api.config.mjs

export const IS_DEV_MODE = true  // ← Cambiar a false para producción

const URL_BASE_DEV_MODE = 'http://localhost:3000/api/v1'
const URL_BASE_PRODUCTION = ''   // ← Configurar la URL de producción aquí

export const URL_BASE = IS_DEV_MODE ? URL_BASE_DEV_MODE : URL_BASE_PRODUCTION
```

**Para una implementación con variables de entorno Vite**, se recomienda:

```env
# .env.development
VITE_API_BASE_URL=http://localhost:3000/api/v1

# .env.production
VITE_API_BASE_URL=https://api.bitfive.com/api/v1
```

Y adaptando `api.config.mjs`:

```javascript
export const URL_BASE = import.meta.env.VITE_API_BASE_URL
```

**Variables de Firebase** (actualmente embebidas en `firebase.config.mjs`):

Para producción, se recomienda moverlas a variables de entorno:

```env
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_DATABASE_URL=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
```

---

## 10. Instalación y ejecución

### Prerrequisitos

- Node.js ≥ 20 LTS
- npm ≥ 10
- El backend (`/api`) debe estar corriendo en `localhost:3000` para el modo desarrollo

### Instalación

```bash
cd app
npm install
```

### Iniciar servidor de desarrollo

```bash
npm run dev
```

> Vite arrancará en `http://localhost:5173` con hot-reload (HMR) activado.

### Lint del código

```bash
npm run lint
```

### Compilar para producción

```bash
npm run build
# Output en ./dist/
```

La carpeta `dist/` contiene el bundle optimizado listo para desplegar en cualquier servidor de archivos estáticos (Nginx, Apache, Vercel, Firebase Hosting, etc.).

### Vista previa del build de producción

```bash
npm run preview
```

Sirve localmente el bundle de producción generado por `vite build` para verificar el resultado antes de desplegar.

### Resumen de scripts

| Comando | Descripción |
|---|---|
| `npm run dev` | Servidor de desarrollo con HMR en `http://localhost:5173` |
| `npm run build` | Bundle de producción optimizado en `./dist` |
| `npm run lint` | Análisis estático del código con ESLint |
| `npm run preview` | Sirve el bundle de producción localmente para previsualización |
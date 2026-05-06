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

startMailerWorker()
startReminderScheduler()

const router = new CoreRouter(app, VERSIONING)
await router.explore()

app.use(ErrorMiddleware.handle)

app.listen(PORT, () => {
    console.log(`\n[Server] ${APP_NAME} running on ${HOST_NAME}:${PORT + VERSIONING}\n`)
})
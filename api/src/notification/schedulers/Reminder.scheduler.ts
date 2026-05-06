import { Worker, Queue } from 'bullmq'
import { REDIS_HOST, REDIS_PORT } from '../../core/config/redis.config.js'
import { Database } from '../../core/orm/database/Database.js'
import { mailerQueue } from '../queues/Mailer.queue.js'

const SCHEDULER_QUEUE_NAME = 'reminder-scheduler'
const CHECK_INTERVAL_MS = 60 * 60 * 1000

interface UpcomingEnrollment {
    eventId: string
    eventName: string
    startAt: string
    location: string
    userEmail: string
    userName: string
}

async function findUpcomingEnrollments(): Promise<UpcomingEnrollment[]> {
    const db = Database.getInstance()
    const result = await db.query(`
        SELECT
            ev.id        AS "eventId",
            ev.name      AS "eventName",
            ev."startAt" AS "startAt",
            ev.location  AS "location",
            u.email      AS "userEmail",
            u.username   AS "userName"
        FROM "Events" ev
        INNER JOIN "Enrollments" e ON e."eventId" = ev.id
        INNER JOIN "Users" u ON u.id = e."userId"
        WHERE ev."startAt" BETWEEN NOW() AND NOW() + INTERVAL '24 hours'
          AND ev."isActive" = true
          AND ev."isDeleted" = false
          AND ev."eventStatus" != 'CANCELLED'
          AND e."enrollmentStatus" != 'CANCELLED'
          AND e."isActive" = true
          AND e."isDeleted" = false
    `)
    return result.rows
}

async function processReminderCheck(): Promise<void> {
    const enrollments = await findUpcomingEnrollments()

    for (const enrollment of enrollments) {
        await mailerQueue.add('event-reminder', {
            userEmail: enrollment.userEmail,
            userName: enrollment.userName,
            eventName: enrollment.eventName,
            eventDate: new Date(enrollment.startAt).toLocaleString('es-CO', { timeZone: 'America/Bogota' }),
            eventLocation: enrollment.location,
        }, {
            jobId: `reminder-${enrollment.eventId}-${enrollment.userEmail}`,
        })
    }
}

export function startReminderScheduler(): void {
    const schedulerQueue = new Queue(SCHEDULER_QUEUE_NAME, {
        connection: { host: REDIS_HOST(), port: REDIS_PORT() },
    })

    schedulerQueue.upsertJobScheduler(
        'check-upcoming-events',
        { every: CHECK_INTERVAL_MS },
        { name: 'check-upcoming-events' },
    )

    const worker = new Worker(SCHEDULER_QUEUE_NAME, async () => {
        try {
            await processReminderCheck()
        } catch (err: any) {
            console.error('[ReminderScheduler] Error:', err.message)
        }
    }, {
        connection: { host: REDIS_HOST(), port: REDIS_PORT() },
    })

    worker.on('failed', (_job, err) => {
        console.error('[ReminderScheduler] ✘ Job fallido:', err.message)
    })
}

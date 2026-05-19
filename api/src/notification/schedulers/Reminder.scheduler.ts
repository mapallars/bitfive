import { Worker, Queue } from 'bullmq'
import { getRedisConnection } from '../../core/config/redisConnection.js'
import { Database } from '../../core/orm/database/Database.js'
import { mailerQueue } from '../queues/Mailer.queue.js'

const SCHEDULER_QUEUE_NAME = 'reminder-scheduler'
const CHECK_INTERVAL_MS = 60 * 60 * 1000

interface UpcomingEnrollment {
    enrollmentId: string
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
            e.id         AS "enrollmentId",
            ev.id        AS "eventId",
            ev.name      AS "eventName",
            ev."startAt" AS "startAt",
            ev.location  AS "location",
            u.email      AS "userEmail",
            u.username   AS "userName"
        FROM "Events" ev
        INNER JOIN "Enrollments" e ON e."eventId" = ev.id
        INNER JOIN "Users" u ON u.id = e."userId"
        WHERE ev."startAt" BETWEEN NOW() + INTERVAL '23 hours' AND NOW() + INTERVAL '25 hours'
          AND ev."isActive" = true
          AND ev."isDeleted" = false
          AND ev."eventStatus" != 'CANCELLED'
          AND e."enrollmentStatus" NOT IN ('CANCELLED', 'CHECKED_IN')
          AND e."reminderSentAt" IS NULL
          AND e."isActive" = true
          AND e."isDeleted" = false
    `)
    return result.rows
}

async function markReminderSent(enrollmentId: string): Promise<void> {
    const db = Database.getInstance()
    await db.query(
        `UPDATE "Enrollments" SET "reminderSentAt" = NOW(), "updatedAt" = NOW() WHERE id = $1`,
        [enrollmentId]
    )
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
            jobId: `reminder-${enrollment.enrollmentId}`,
        })
        await markReminderSent(enrollment.enrollmentId)
    }
}

export function startReminderScheduler(): { queue: Queue; worker: Worker } {
    const connection = getRedisConnection()

    const schedulerQueue = new Queue(SCHEDULER_QUEUE_NAME, { connection })

    schedulerQueue.upsertJobScheduler(
        'check-upcoming-events',
        { every: CHECK_INTERVAL_MS },
        { name: 'check-upcoming-events' },
    )

    const worker = new Worker(SCHEDULER_QUEUE_NAME, async () => {
        try {
            await processReminderCheck()
        } catch (err: any) {
            console.error('[Reminder] Error en processReminderCheck:', err.message)
        }
    }, { connection })

    worker.on('failed', (_job, err) => {
        console.error('[Reminder] ✘ Job fallido:', err.message)
    })

    console.log('[Reminder] ✔ Scheduler de recordatorios iniciado')

    return { queue: schedulerQueue, worker }
}

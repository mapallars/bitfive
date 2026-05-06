import { Worker, Job } from 'bullmq'
import { REDIS_HOST, REDIS_PORT } from '../../core/config/redis.config.js'
import mailerService from '../services/Mailer.service.js'

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

        default:
            console.warn(`[MailerWorker] Tipo de job desconocido: "${job.name}"`)
    }
}

export function startMailerWorker(): Worker {
    const worker = new Worker('mailer', processJob, {
        connection: {
            host: REDIS_HOST(),
            port: REDIS_PORT(),
        },
        concurrency: 5,
    })

    worker.on('failed', (job, err) => {
        console.error(`[MailerWorker] ✘ Job fallido: ${job?.name} (id: ${job?.id}) — ${err.message}`)
    })

    worker.on('error', (err) => {
        console.error(`[MailerWorker] Error en worker: ${err.message}`)
    })

    return worker
}

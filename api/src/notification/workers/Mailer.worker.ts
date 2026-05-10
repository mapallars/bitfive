import { Worker, Job } from 'bullmq'
import { getRedisConnection } from '../../core/config/redisConnection.js'
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
        connection: getRedisConnection(),
        concurrency: 5,
    })

    worker.on('completed', (job) => {
        console.log(`[Mailer] ✔ Job completado: ${job.name} (id: ${job.id})`)
    })

    worker.on('failed', (job, err) => {
        console.error(`[Mailer] ✘ Job fallido: ${job?.name} (id: ${job?.id}) — ${err.message}`)
    })

    worker.on('error', (err) => {
        console.error(`[Mailer] Error en worker: ${err.message}`)
    })

    console.log('[Mailer] ✔ Worker de correos iniciado')

    return worker
}

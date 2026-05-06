import { Queue } from 'bullmq'
import { REDIS_HOST, REDIS_PORT } from '../../core/config/redis.config.js'

let _queue: Queue | null = null

export function getMailerQueue(): Queue {
    if (!_queue) {
        _queue = new Queue('mailer', {
            connection: {
                host: REDIS_HOST(),
                port: REDIS_PORT(),
            },
            defaultJobOptions: {
                attempts: 3,
                backoff: {
                    type: 'exponential',
                    delay: 5000,
                },
                removeOnComplete: 100,
                removeOnFail: 200,
            },
        })
    }
    return _queue
}

export const mailerQueue = { add: (...args: Parameters<Queue['add']>) => getMailerQueue().add(...args) }

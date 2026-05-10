import { Queue } from 'bullmq'
import { getRedisConnection } from '../../core/config/redisConnection.js'

let _queue: Queue | null = null

export function getMailerQueue(): Queue {
    if (!_queue) {
        _queue = new Queue('mailer', {
            connection: getRedisConnection(),
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

export async function closeMailerQueue(): Promise<void> {
    if (_queue) {
        await _queue.close()
        _queue = null
    }
}

export const mailerQueue = { add: (...args: Parameters<Queue['add']>) => getMailerQueue().add(...args) }

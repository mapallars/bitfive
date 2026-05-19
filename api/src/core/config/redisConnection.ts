import { Redis } from 'ioredis'
import { REDIS_HOST, REDIS_PORT } from './redis.config.js'

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

export async function closeRedisConnection(): Promise<void> {
    if (_connection) {
        await _connection.quit()
        _connection = null
    }
}

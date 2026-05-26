import { Redis } from 'ioredis'
import { REDIS_HOST, REDIS_PORT, REDIS_PASSWORD, REDIS_TLS, REDIS_URL } from './redis.config.js'

let _connection: Redis | null = null

function createRedisConnection(): Redis {
    const common = { maxRetriesPerRequest: null } as const
    const url = REDIS_URL()

    if (url) {
        return new Redis(url, common)
    }

    return new Redis({
        host: REDIS_HOST(),
        port: REDIS_PORT(),
        password: REDIS_PASSWORD() || undefined,
        tls: REDIS_TLS() ? {} : undefined,
        ...common,
    })
}

export function getRedisConnection(): Redis {
    if (!_connection) {
        _connection = createRedisConnection()
    }
    return _connection
}

export async function verifyRedisConnection(): Promise<void> {
    const redis = getRedisConnection()
    await redis.ping()
}

export async function closeRedisConnection(): Promise<void> {
    if (_connection) {
        await _connection.quit()
        _connection = null
    }
}

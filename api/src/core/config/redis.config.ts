export const REDIS_URL = () => process.env.REDIS_URL || ''
export const REDIS_HOST = () => process.env.REDIS_HOST || 'localhost'
export const REDIS_PORT = () => Number(process.env.REDIS_PORT) || 6379
export const REDIS_PASSWORD = () => process.env.REDIS_PASSWORD || ''

export const REDIS_TLS = (): boolean => {
    const explicit = process.env.REDIS_TLS
    if (explicit === 'true') return true
    if (explicit === 'false') return false
    return REDIS_URL().startsWith('rediss://')
}

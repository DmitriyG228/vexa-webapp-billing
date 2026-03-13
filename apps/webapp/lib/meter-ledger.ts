/**
 * Meter event ledger — parallel log of every MeterEvent.create() call.
 *
 * Stored in Redis sorted set per customer, score = unix timestamp.
 * Auto-truncates entries older than 30 days on every write.
 *
 * Key format: meter_ledger:{stripe_customer_id}
 * Member: JSON { event_name, value, timestamp }
 */
import Redis from 'ioredis'

const LEDGER_TTL_DAYS = 30
const LEDGER_TTL_SECONDS = LEDGER_TTL_DAYS * 86400

let _redis: Redis | null = null

function getRedis(): Redis {
  if (!_redis) {
    const url = process.env.METER_LEDGER_REDIS_URL || process.env.REDIS_URL || 'redis://localhost:6379/0'
    _redis = new Redis(url, { maxRetriesPerRequest: 1, lazyConnect: true })
    _redis.on('error', (err) => {
      console.error('[METER-LEDGER] Redis error:', err.message)
    })
  }
  return _redis
}

function ledgerKey(customerId: string): string {
  return `meter_ledger:${customerId}`
}

export async function recordMeterEvent(
  customerId: string,
  eventName: string,
  value: number,
): Promise<void> {
  const now = Date.now() / 1000
  const entry = JSON.stringify({
    event_name: eventName,
    value,
    timestamp: now,
  })

  try {
    const redis = getRedis()
    const key = ledgerKey(customerId)
    await redis.zadd(key, now, entry)
    // Trim entries older than 30 days
    await redis.zremrangebyscore(key, '-inf', now - LEDGER_TTL_SECONDS)
  } catch (err) {
    console.error(`[METER-LEDGER] Failed to record ${eventName} for ${customerId}:`, err)
  }
}

export interface LedgerEntry {
  event_name: string
  value: number
  timestamp: number
}

export async function getLedgerEntries(
  customerId: string,
  sinceDays = 30,
): Promise<LedgerEntry[]> {
  const now = Date.now() / 1000
  const since = now - sinceDays * 86400

  try {
    const redis = getRedis()
    const raw = await redis.zrangebyscore(ledgerKey(customerId), since, '+inf')
    return raw.map((r) => JSON.parse(r) as LedgerEntry)
  } catch (err) {
    console.error(`[METER-LEDGER] Failed to read ledger for ${customerId}:`, err)
    return []
  }
}

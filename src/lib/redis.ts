import Redis from 'ioredis';

const REDIS_URL = process.env.REDIS_URL;

class RedisManager {
  private static instance: { pub: Redis | null, sub: Redis | null } = { pub: null, sub: null };

  static getClients() {
    if (!this.instance.pub && REDIS_URL) {
      try {
        this.instance.pub = new Redis(REDIS_URL, { lazyConnect: true });
        this.instance.sub = new Redis(REDIS_URL, { lazyConnect: true });
        
        this.instance.pub.on('error', (err) => console.warn('Redis Pub Error:', err.message));
        this.instance.sub!.on('error', (err) => console.warn('Redis Sub Error:', err.message));
      } catch(e) {
        console.warn('Failed to initialize Redis clients');
      }
    }
    return this.instance;
  }
}

export default RedisManager;

import type { NextFunction } from 'express';
import { RateLimiterMemory } from 'rate-limiter-flexible';

const opts = {
  points: 200,
  duration: 2,
};

const rateLimiter = new RateLimiterMemory(opts);

export const limiter = async (req: any, res: any, next: NextFunction) => {
  try {
    await rateLimiter.consume(req.connection.remoteAddress);

    next();
  } catch (error: any) {
    res.set({
      'Retry-After': error.msBeforeNext / 1000,
      'X-RateLimit-Reset': new Date(Date.now() + error.msBeforeNext),
    });
    return res.status(429).send({ error: 'Too many requests try again later' });
  }
};
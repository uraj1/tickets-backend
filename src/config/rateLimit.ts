import type { NextFunction } from 'express';
import { RateLimiterMemory } from 'rate-limiter-flexible';

const opts = {
  points: 200,
  duration: 2,
};

const rateLimiter = new RateLimiterMemory(opts);

// This middleware will limit the number of requests to 200 per 2 seconds
// and will return a 429 status code if the limit is exceeded
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
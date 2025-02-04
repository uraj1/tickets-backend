import type { NextFunction } from 'express';

export const isLoggedIn = (req: any, res: any, next: NextFunction) => {
  req.user ? next() : res.sendStatus(401);
};
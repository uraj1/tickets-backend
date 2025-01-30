import { NextFunction, Request } from "express";

export const ensureAuthenticated = (req: Request, res: any, next: NextFunction) => {
  console.log('Is Authenticated:', req.isAuthenticated());
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: "Unauthorized access" });
};
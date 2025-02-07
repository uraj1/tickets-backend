import { Request, Response, NextFunction } from "express";

interface AuthenticatedUser {
  _id: string;
  email: string;
  isSuperAdmin: boolean;
}

const requireSuperAdmin = (req: Request, res: Response, next: NextFunction): void => {
  const user = req.user as AuthenticatedUser | undefined;

  if (!user || !user.isSuperAdmin) {
    res.status(403).json({ message: "Oopsie doopsie! You are a keen person!" });
    return;
  }

  next();
};

export default requireSuperAdmin;

import { Request, Response, NextFunction } from "express";

interface AuthenticatedRequest extends Request {
  user?: {
    _id: string;
    email: string;
    isSuperAdmin: boolean;
  };
}

const requireSuperAdmin = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  if (!req.user || !req.user.isSuperAdmin) {
    return res.status(403).json({ message: "Access denied. Super Admins only." });
  }
  next();
};

export default requireSuperAdmin;


import e, { Request, Response, NextFunction } from 'express';
export const Auth = (req: Request, _: Response, next: NextFunction) => {
  if (req.currentUser == null) return next(new Error('Unauthorized user'));
  next();
};

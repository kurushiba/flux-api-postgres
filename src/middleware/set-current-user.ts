import { Request, Response, NextFunction } from 'express';
import datasource from '../datasource';
import { User } from '../modules/users/user.entity';
import { decodeJwt } from '../lib/jwt';

export default async (req: Request, _res: Response, next: NextFunction) => {
  const token = _getTokenFromHeader(req);
  if (!token) return next();
  try {
    const id = decodeJwt(token);
    const userRepository = datasource.getRepository(User);
    const user = await userRepository.findOne({
      where: { id },
    });
    if (!user) return next();
    req.currentUser = user;
  } catch (e) {
    console.error(e);
    throw new Error('Unauthorized');
  }

  next();
};

const _getTokenFromHeader = (req: Request): string | undefined => {
  if (
    req.headers.authorization &&
    req.headers.authorization.split(' ')[0] === 'Bearer'
  ) {
    return req.headers.authorization.split(' ')[1];
  }
};

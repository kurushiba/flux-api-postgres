import * as jwt from 'jsonwebtoken';

export const encodeJwt = (userId: string): string => {
  return jwt.sign(userId, _getJwtSecret());
};

export const decodeJwt = (token: string): string => {
  return jwt.verify(token, _getJwtSecret()) as string;
};

const _getJwtSecret = (): string => {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('Set JWT_SECRET in .env');
  return secret;
};

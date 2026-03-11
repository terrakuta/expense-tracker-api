import type { Request } from 'express';
import type { JwtPayload } from './jwt.interface';

export interface AuthRequest extends Request {
  user?: JwtPayload;
}
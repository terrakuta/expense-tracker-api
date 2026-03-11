import { Request } from 'express';

export interface userIdReq extends Request {
  user: { id: string };
}
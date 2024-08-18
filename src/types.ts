import { Request as ExpressReq } from 'express';

export interface Request extends ExpressReq {
  user_id?: string;
}

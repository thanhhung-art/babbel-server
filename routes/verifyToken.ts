import jwt, { JwtPayload } from 'jsonwebtoken'
import { Request, Response, NextFunction } from 'express';

export const verifyToken = (req: Request, res: Response, next: NextFunction) => {
  const token = req.cookies['authtoken'];
  const jwt_secret: any = process.env.JWT_SECRET
  let jwt_payload: JwtPayload<{ _id: string }>
  
  if (token && jwt_secret) {
    jwt_payload = jwt.verify(token, jwt_secret)
    if (jwt_payload) {
      if (jwt_payload._id === req.headers['authid']) {
        next()
        return
      } else {
        return res.status(401).json({ msg: 'you are not authorized!' })
      }
    }
  }
};
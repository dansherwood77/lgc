import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import { User } from '../models/User';

declare global {
  namespace Express {
    interface Request {
      user?: {
        _id: string;
        email: string;
      };
    }
  }
}

interface JwtPayload {
  _id: string;
}

export const auth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      throw new Error();
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as JwtPayload;
    const user = await User.findById(decoded._id);

    if (!user) {
      throw new Error();
    }

    req.user = {
      _id: user._id.toString(),
      email: user.email
    };
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(401).json({ error: 'Please authenticate' });
  }
}; 
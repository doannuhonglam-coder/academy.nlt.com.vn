import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { pool } from '../db';

export type AcademyRole =
  | 'owner'
  | 'admin'
  | 'leader'
  | 'co-leader'
  | 'member'
  | 'community_learner';

export interface AuthUser {
  id: string;
  email: string;
  academy_role: AcademyRole;
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

const JWT_SECRET = process.env.SUPABASE_JWT_SECRET;

/**
 * Validate Supabase JWT and load academy_role from persons table.
 * Attaches req.user on success.
 */
export async function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    res.status(401).json({ code: 'UNAUTHORIZED', message: 'Missing token', details: {}, request_id: '' });
    return;
  }

  const token = header.slice(7);

  try {
    if (!JWT_SECRET) throw new Error('SUPABASE_JWT_SECRET not configured');

    const payload = jwt.verify(token, JWT_SECRET) as { sub: string; email: string };

    // Load role from persons table
    const { rows } = await pool.query<{ role: string }>(
      'SELECT role FROM persons WHERE id = $1 LIMIT 1',
      [payload.sub],
    );

    const dbRole = rows[0]?.role ?? null;

    // Map internal role → academy role; unknown = community_learner
    const roleMap: Record<string, AcademyRole> = {
      owner: 'owner',
      admin: 'admin',
      leader: 'leader',
      'co-leader': 'co-leader',
      member: 'member',
    };

    req.user = {
      id: payload.sub,
      email: payload.email,
      academy_role: (dbRole && roleMap[dbRole]) ? roleMap[dbRole] : 'community_learner',
    };

    next();
  } catch {
    res.status(401).json({ code: 'INVALID_TOKEN', message: 'Invalid or expired token', details: {}, request_id: '' });
  }
}

/**
 * Optional auth — attaches req.user if token present, otherwise continues.
 */
export async function optionalAuth(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  if (!req.headers.authorization) return next();
  return requireAuth(req, res, next);
}

/**
 * Role-based guard factory. Usage: requireRole('admin', 'owner')
 */
export function requireRole(...roles: AcademyRole[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user || !roles.includes(req.user.academy_role)) {
      res.status(403).json({ code: 'FORBIDDEN', message: 'Insufficient role', details: {}, request_id: '' });
      return;
    }
    next();
  };
}

import { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';

export const notFound = (_req: Request, res: Response) => {
  res.status(404).json({ message: 'Not found' });
};

export const errorHandler = (err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof ZodError) {
    return res.status(400).json({ message: 'Validation error', issues: err.flatten() });
  }

  if (err instanceof Error) {
    return res.status(500).json({ message: err.message });
  }

  return res.status(500).json({ message: 'Internal server error' });
};

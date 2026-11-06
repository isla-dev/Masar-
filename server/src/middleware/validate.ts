import { NextFunction, Request, Response } from 'express';
import { AnyZodObject } from 'zod';

/**
 * Validates req.body (and optionally req.query/req.params) against a Zod
 * schema. Throws (caught by errorHandler) on failure, so route handlers can
 * assume validated input.
 */
export function validateBody(schema: AnyZodObject) {
  return (req: Request, _res: Response, next: NextFunction) => {
    req.body = schema.parse(req.body);
    next();
  };
}

/**
 * Validates req.query. The parsed/coerced result is stashed on
 * res.locals.query rather than reassigned onto req.query, since Express 4
 * defines req.query as a getter-only property in some versions/typings.
 */
export function validateQuery(schema: AnyZodObject) {
  return (req: Request, res: Response, next: NextFunction) => {
    res.locals.query = schema.parse(req.query);
    next();
  };
}

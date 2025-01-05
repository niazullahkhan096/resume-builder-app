import { Request, Response, NextFunction } from 'express';

const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction): void => {
  console.error(err.stack);

  const isOperationalError = err.name === 'OperationalError';
  const statusCode = isOperationalError ? 400 : 500;
  const errorMessage = isOperationalError
    ? err.message
    : 'Internal Server Error';

  res.status(statusCode).json({ message: errorMessage, error: err.message });
};

export default errorHandler;
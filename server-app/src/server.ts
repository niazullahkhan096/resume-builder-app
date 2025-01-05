import express, { Application, Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import morgan from 'morgan';
import helmet from 'helmet';
import { Server } from 'http';
import routes from './routes';

// Load environment variables from .env file
dotenv.config();

// Initialize the express app
const app: Application = express();

// Middleware
app.use(cors()); // Enable CORS
app.use(helmet()); // Secure app with HTTP headers
app.use(morgan('dev')); // Log HTTP requests
app.use(express.json()); // Parse JSON request bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded request bodies

// Routes
app.use('/api', routes);

// Catch-all route for invalid URIs (404 handler)
app.use((req: Request, res: Response) => {
  res.status(404).json({ message: 'Error: Route not found', error: null });
});

// Example error handling middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);

  const isOperationalError = err.name === 'OperationalError';
  const statusCode = isOperationalError ? 400 : 500;
  const errorMessage = isOperationalError
    ? err.message
    : 'Something went wrong on the server.';

  res.status(statusCode).json({ message: errorMessage, error: err.message });
});

// Start the server
const PORT = process.env.PORT || 3000;
let server: Server;

const startServer = async (): Promise<void> => {
  try {
    server = app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

// Graceful shutdown
const shutdown = async (): Promise<void> => {
  console.log('Shutting down server...');
  server.close(() => {
    console.log('Server shut down successfully.');
    process.exit(0);
  });
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  shutdown();
});
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  shutdown();
});

export default app;
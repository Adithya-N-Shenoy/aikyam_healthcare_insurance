export class AppError extends Error {
  statusCode: number;
  isOperational: boolean;

  constructor(message: string, statusCode: number = 500, isOperational: boolean = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    Error.captureStackTrace(this, this.constructor);
  }
}

export const handleApiError = (error: any) => {
  console.error('API Error:', error);

  if (error instanceof AppError) {
    return {
      message: error.message,
      statusCode: error.statusCode,
      isOperational: error.isOperational
    };
  }

  // Handle Supabase errors
  if (error.code) {
    switch (error.code) {
      case '23505':
        return {
          message: 'Duplicate entry found',
          statusCode: 409,
          isOperational: true
        };
      case '23503':
        return {
          message: 'Referenced record not found',
          statusCode: 404,
          isOperational: true
        };
      case '42P01':
        return {
          message: 'Database table not found',
          statusCode: 500,
          isOperational: false
        };
      default:
        return {
          message: error.message || 'Database error occurred',
          statusCode: 500,
          isOperational: false
        };
    }
  }

  // Handle Gemini errors
  if (error.message?.includes('Gemini')) {
    return {
      message: error.message,
      statusCode: 503,
      isOperational: true
    };
  }

  // Default error
  return {
    message: error.message || 'An unexpected error occurred',
    statusCode: 500,
    isOperational: false
  };
};

export const logError = (error: any, context?: string) => {
  const timestamp = new Date().toISOString();
  const errorInfo = {
    timestamp,
    context: context || 'unknown',
    message: error.message,
    stack: error.stack,
    ...(error.code && { code: error.code }),
    ...(error.details && { details: error.details })
  };

  console.error('Error Log:', errorInfo);

  // Here you could also send to a logging service
  // await fetch('/api/logs', { method: 'POST', body: JSON.stringify(errorInfo) });
};
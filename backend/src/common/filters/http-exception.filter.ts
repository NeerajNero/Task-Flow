/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
} from '@nestjs/common';
import { Response } from 'express';
import { LoggerService } from 'src/logger/logger.service';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  constructor(private readonly logger: LoggerService) {}

  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();

    // Extract the raw response object (which contains the validation errors)
    const exceptionResponse = exception.getResponse();

    // Determine the error message
    // If it's a Validation Error, 'message' will be an array of strings
    const message =
      typeof exceptionResponse === 'object' && 'message' in exceptionResponse
        ? (exceptionResponse as { message: string }).message
        : exception.message;

    const errorResponse = {
      statusCode: status,
      status: 'Failure',
      message: message, // This will now show ["email must be an email", ...]
      error: exception.getResponse()['error'] || 'HttpException',
      timestamp: new Date().toISOString(),
      path: request.url,
    };

    // Enhanced Logging: Log the specific validation errors
    this.logger.error(
      `[HttpException] ${request.method} ${request.url} - ${status}`,
      // If message is an array (validation errors), verify JSON stringify it for the logs
      Array.isArray(message) ? JSON.stringify(message) : message,
      `${HttpExceptionFilter.name}`,
    );

    response.status(status).json(errorResponse);
  }
}

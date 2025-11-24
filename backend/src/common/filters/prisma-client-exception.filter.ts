import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { Prisma } from '@prisma/client';
import { LoggerService } from 'src/logger/logger.service';

@Catch(Prisma.PrismaClientKnownRequestError)
export class PrismaClientExceptionFilter implements ExceptionFilter {
  constructor(private readonly logger: LoggerService) {}

  catch(exception: Prisma.PrismaClientKnownRequestError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'An internal database error occurred';

    switch (exception.code) {
      // P2002: Unique constraint failed
      case 'P2002':
        status = HttpStatus.CONFLICT; // 409
        message = `A resource with this ${exception.meta?.target?.[0]} already exists.`;
        break;

      // P2025: Record to update/delete not found
      case 'P2025':
        status = HttpStatus.NOT_FOUND; // 404
        message = 'The requested resource was not found.';
        break;

      default:
        status = HttpStatus.BAD_REQUEST; // 400
        message = 'A database-related error occurred.';
        break;
    }

    const errorResponse = {
      statusCode: status,
      status: 'Failure',
      message: message,
      error: exception.name,
      timestamp: new Date().toISOString(),
      path: request.url,
    };

    this.logger.error(
      `[PrismaException] ${request.method} ${request.url} - ${exception.code}`,
      exception.stack,
      `${PrismaClientExceptionFilter.name}`,
    );

    response.status(status).json(errorResponse);
  }
}

import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  createLogger,
  format,
  transports,
  Logger as WinstonLogger,
} from 'winston';
import * as DailyRotateFile from 'winston-daily-rotate-file';

@Injectable()
export class LoggerService {
  private isLoggingEnabled: boolean;
  private logger: WinstonLogger;

  constructor(private readonly configService: ConfigService) {
    const config = this.configService.get<string>('NODE_ENV');
    this.isLoggingEnabled = config !== 'production';

    this.logger = createLogger({
      level: this.isLoggingEnabled ? 'debug' : 'error', // Log only errors in production
      format: format.combine(
        format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        format.printf(({ timestamp, level, message, context }) => {
          // eslint-disable-next-line @typescript-eslint/restrict-template-expressions, @typescript-eslint/no-base-to-string
          return `${timestamp} [${level}] [${context || 'App'}]: ${message}`;
        }),
      ),
      transports: [
        new transports.Console({
          format: format.combine(
            format.colorize(),
            format.printf(({ timestamp, level, message, context }) => {
              // eslint-disable-next-line @typescript-eslint/restrict-template-expressions, @typescript-eslint/no-base-to-string
              return `${timestamp} [${level}] [${context || 'App'}]: ${message}`;
            }),
          ),
        }),
        new DailyRotateFile.default({
          filename: 'logs/application-%DATE%.log',
          datePattern: 'YYYY-MM-DD',
          zippedArchive: true,
          maxSize: '20m',
          maxFiles: '1d', // Keep file for only 1 day
        }),
      ],
    });
  }

  error(message: string, trace?: string, context?: string) {
    if (this.isLoggingEnabled) {
      this.logger.error({ message, trace, context });
    }
  }

  log(message: string, context?: string) {
    if (this.isLoggingEnabled) {
      this.logger.info({ message, context });
    }
  }

  warn(message: string, context?: string) {
    if (this.isLoggingEnabled) {
      this.logger.warn({ message, context });
    }
  }

  debug(message: string, context?: string) {
    if (this.isLoggingEnabled) {
      this.logger.debug({ message, context });
    }
  }
}

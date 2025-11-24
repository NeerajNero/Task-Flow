// backend/src/config/env-config.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import * as Joi from 'joi';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // <-- Makes config available everywhere
      envFilePath: '../.env', // <-- Point to the root .env file
      validationSchema: Joi.object({
        // --- Application ---
        NODE_ENV: Joi.string()
          .valid('development', 'production', 'test')
          .default('development'),

        // --- Database (from DBModule doc) ---
        DATABASE_URL: Joi.string().required(),

        // --- Redis (from BullMQ doc) ---
        REDIS_HOST: Joi.string().required(),
        REDIS_PORT: Joi.number().required(),

        // --- Auth (from Auth doc) ---
        JWT_SECRET: Joi.string().required(),
        REFRESH_JWT_SECRET: Joi.string().required(),

        // --- Email (from Email doc) ---
        SENDGRID_API_KEY: Joi.string().required(),

        // --- SMS (from SMS doc) ---
        TWILIO_ACCOUNT_SID: Joi.string().required(),
        TWILIO_AUTH_TOKEN: Joi.string().required(),
        TWILIO_SOURCE_NUMBER: Joi.string().required(),
      }),
    }),
  ],
})
export class EnvConfigModule {}

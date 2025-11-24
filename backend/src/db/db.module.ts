import { Global, Module } from '@nestjs/common';
import { DbService } from './db.service';
import { AuthDbService } from '../api/auth/auth-db.service';
import { AuthRepository } from '../api/auth/auth.repository';
import { CustomersDbService } from 'src/api/customers/customers-db.service';
import { CustomersRepository } from 'src/api/customers/cutsomers.repository';
import { TicketsDbService } from 'src/api/tickets/tickets-db.service';
import { TicketsRepository } from 'src/api/tickets/tickets.repository';

@Global()
@Module({
  providers: [
    DbService,
    AuthDbService,
    AuthRepository,
    CustomersDbService,
    CustomersRepository,
    TicketsDbService,
    TicketsRepository,
  ],
  exports: [DbService, AuthDbService, CustomersDbService, TicketsDbService],
})
export class DbModule {}

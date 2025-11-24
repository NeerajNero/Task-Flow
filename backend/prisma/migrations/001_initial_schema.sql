-- file: migrations/001_initial_schema.sql

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- A Tenant is the "Company" that buys your software
CREATE TABLE "Tenant" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "name" TEXT NOT NULL
);

-- A User is an admin/agent who logs into the system
CREATE TABLE "User" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "email" TEXT NOT NULL UNIQUE,
    "password" TEXT NOT NULL,
    "roles" TEXT[] NOT NULL DEFAULT ARRAY['admin']::TEXT[],
    "tenantId" UUID NOT NULL REFERENCES "Tenant"("id") ON DELETE CASCADE
);

-- A Customer is a client of your Tenant
CREATE TABLE "Customer" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
    "tenantId" UUID NOT NULL REFERENCES "Tenant"("id") ON DELETE CASCADE,
    
    -- An email should be unique *per tenant*
    UNIQUE("tenantId", "email")
);

-- The main Ticket table
CREATE TYPE "TicketStatus" AS ENUM ('OPEN', 'IN_PROGRESS', 'RESOLVED');

CREATE TABLE "Ticket" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "status" "TicketStatus" NOT NULL DEFAULT 'OPEN',
    "assignedTo" TEXT, -- Can be a User ID or name
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
    
    "tenantId" UUID NOT NULL REFERENCES "Tenant"("id") ON DELETE CASCADE,
    "customerId" UUID NOT NULL REFERENCES "Customer"("id") ON DELETE CASCADE
);

-- The log of all background-worker-generated events
CREATE TABLE "NotificationLog" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "message" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),

    "tenantId" UUID NOT NULL REFERENCES "Tenant"("id") ON DELETE CASCADE,
    "ticketId" UUID NOT NULL REFERENCES "Ticket"("id") ON DELETE CASCADE
);

-- Add indexes for common lookups
CREATE INDEX "idx_user_tenantId" ON "User"("tenantId");
CREATE INDEX "idx_customer_tenantId" ON "Customer"("tenantId");
CREATE INDEX "idx_ticket_tenantId" ON "Ticket"("tenantId");
CREATE INDEX "idx_ticket_status" ON "Ticket"("status");
CREATE INDEX "idx_notificationlog_tenantId" ON "NotificationLog"("tenantId");
CREATE INDEX "idx_notificationlog_ticketId" ON "NotificationLog"("ticketId");
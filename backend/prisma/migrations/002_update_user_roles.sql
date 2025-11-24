
-- This adds the necessary ENUM type to the database
CREATE TYPE "UserRole" AS ENUM ('admin', 'agent');

-- The following steps modify the User table to use this new, strict type:

-- 1. Rename the old TEXT[] column (to save its data if we had any)
ALTER TABLE "User" RENAME COLUMN "roles" TO "old_roles_text";

-- 2. Add the new column using the strict ENUM array type
ALTER TABLE "User" ADD COLUMN "roles" "UserRole"[] NOT NULL DEFAULT ARRAY['admin']::"UserRole"[];

-- 3. Drop the old column (optional, but clean)
ALTER TABLE "User" DROP COLUMN "old_roles_text";
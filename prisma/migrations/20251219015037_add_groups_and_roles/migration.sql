-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'POWER_USER', 'READ_ONLY');

-- CreateTable
CREATE TABLE "groups" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "allowPowerUserEdit" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "groups_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "group_memberships" (
    "id" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'READ_ONLY',
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    "groupId" TEXT NOT NULL,

    CONSTRAINT "group_memberships_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "groups_slug_key" ON "groups"("slug");

-- CreateIndex
CREATE INDEX "group_memberships_groupId_idx" ON "group_memberships"("groupId");

-- CreateIndex
CREATE INDEX "group_memberships_userId_idx" ON "group_memberships"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "group_memberships_userId_groupId_key" ON "group_memberships"("userId", "groupId");

-- AddForeignKey
ALTER TABLE "group_memberships" ADD CONSTRAINT "group_memberships_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "group_memberships" ADD CONSTRAINT "group_memberships_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "groups"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Backward compatibility: Create default groups for existing users
INSERT INTO "groups" ("id", "name", "slug", "allowPowerUserEdit", "createdAt", "updatedAt")
SELECT
  gen_random_uuid()::text,
  COALESCE("name" || '''s Recipe Group', SPLIT_PART("email", '@', 1) || '''s Recipe Group'),
  'group-' || LOWER(SUBSTRING("id", 1, 8)),
  true,
  NOW(),
  NOW()
FROM "users"
WHERE NOT EXISTS (
  SELECT 1 FROM "group_memberships" WHERE "group_memberships"."userId" = "users"."id"
);

-- Backward compatibility: Create admin memberships for existing users
INSERT INTO "group_memberships" ("id", "role", "userId", "groupId", "joinedAt")
SELECT
  gen_random_uuid()::text,
  'ADMIN'::"Role",
  u."id",
  g."id",
  NOW()
FROM "users" u
JOIN "groups" g ON g."slug" = 'group-' || LOWER(SUBSTRING(u."id", 1, 8))
WHERE NOT EXISTS (
  SELECT 1 FROM "group_memberships" WHERE "group_memberships"."userId" = u."id"
);

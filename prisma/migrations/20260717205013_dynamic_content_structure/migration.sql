-- CreateTable
CREATE TABLE "ContentArea" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "materialType" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Category" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "subsectionKind" TEXT NOT NULL DEFAULT 'NONE',
    "contentAreaId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Category_contentAreaId_fkey" FOREIGN KEY ("contentAreaId") REFERENCES "ContentArea" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Category" ("createdAt", "description", "id", "slug", "title", "updatedAt") SELECT "createdAt", "description", "id", "slug", "title", "updatedAt" FROM "Category";
DROP TABLE "Category";
ALTER TABLE "new_Category" RENAME TO "Category";
CREATE UNIQUE INDEX "Category_slug_key" ON "Category"("slug");
CREATE INDEX "Category_contentAreaId_isActive_sortOrder_idx" ON "Category"("contentAreaId", "isActive", "sortOrder");
CREATE TABLE "new_EcgSection" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "categoryId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "EcgSection_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_EcgSection" ("createdAt", "description", "id", "slug", "sortOrder", "title", "updatedAt") SELECT "createdAt", "description", "id", "slug", "sortOrder", "title", "updatedAt" FROM "EcgSection";
DROP TABLE "EcgSection";
ALTER TABLE "new_EcgSection" RENAME TO "EcgSection";
CREATE UNIQUE INDEX "EcgSection_slug_key" ON "EcgSection"("slug");
CREATE INDEX "EcgSection_categoryId_isActive_sortOrder_idx" ON "EcgSection"("categoryId", "isActive", "sortOrder");
CREATE TABLE "new_VideoLectureSection" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "categoryId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "VideoLectureSection_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_VideoLectureSection" ("createdAt", "description", "id", "slug", "sortOrder", "title", "updatedAt") SELECT "createdAt", "description", "id", "slug", "sortOrder", "title", "updatedAt" FROM "VideoLectureSection";
DROP TABLE "VideoLectureSection";
ALTER TABLE "new_VideoLectureSection" RENAME TO "VideoLectureSection";
CREATE UNIQUE INDEX "VideoLectureSection_slug_key" ON "VideoLectureSection"("slug");
CREATE INDEX "VideoLectureSection_categoryId_isActive_sortOrder_idx" ON "VideoLectureSection"("categoryId", "isActive", "sortOrder");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "ContentArea_slug_key" ON "ContentArea"("slug");

-- CreateIndex
CREATE INDEX "ContentArea_isActive_sortOrder_idx" ON "ContentArea"("isActive", "sortOrder");

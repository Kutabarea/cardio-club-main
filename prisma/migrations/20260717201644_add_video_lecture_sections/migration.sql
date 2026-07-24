-- CreateTable
CREATE TABLE "VideoLectureSection" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Material" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "content" TEXT,
    "type" TEXT NOT NULL,
    "imageUrl" TEXT,
    "videoUrl" TEXT,
    "isPremium" BOOLEAN NOT NULL DEFAULT false,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "categoryId" TEXT,
    "ecgSectionId" TEXT,
    "videoLectureSectionId" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Material_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Material_ecgSectionId_fkey" FOREIGN KEY ("ecgSectionId") REFERENCES "EcgSection" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Material_videoLectureSectionId_fkey" FOREIGN KEY ("videoLectureSectionId") REFERENCES "VideoLectureSection" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Material" ("categoryId", "content", "createdAt", "description", "ecgSectionId", "id", "imageUrl", "isPremium", "isPublished", "slug", "sortOrder", "title", "type", "updatedAt", "videoUrl") SELECT "categoryId", "content", "createdAt", "description", "ecgSectionId", "id", "imageUrl", "isPremium", "isPublished", "slug", "sortOrder", "title", "type", "updatedAt", "videoUrl" FROM "Material";
DROP TABLE "Material";
ALTER TABLE "new_Material" RENAME TO "Material";
CREATE UNIQUE INDEX "Material_slug_key" ON "Material"("slug");
CREATE INDEX "Material_type_isPublished_idx" ON "Material"("type", "isPublished");
CREATE INDEX "Material_categoryId_isPublished_sortOrder_idx" ON "Material"("categoryId", "isPublished", "sortOrder");
CREATE INDEX "Material_ecgSectionId_isPublished_sortOrder_idx" ON "Material"("ecgSectionId", "isPublished", "sortOrder");
CREATE INDEX "Material_videoLectureSectionId_isPublished_sortOrder_idx" ON "Material"("videoLectureSectionId", "isPublished", "sortOrder");
CREATE INDEX "Material_isPublished_updatedAt_idx" ON "Material"("isPublished", "updatedAt");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "VideoLectureSection_slug_key" ON "VideoLectureSection"("slug");

-- CreateIndex
CREATE INDEX "VideoLectureSection_sortOrder_idx" ON "VideoLectureSection"("sortOrder");

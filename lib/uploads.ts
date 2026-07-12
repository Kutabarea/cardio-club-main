import { randomUUID } from "node:crypto";
import { mkdir, readdir, stat, unlink, writeFile } from "node:fs/promises";
import path from "node:path";

export const MAX_MATERIAL_IMAGE_SIZE = 5 * 1024 * 1024;

const allowedImageTypes = new Map([
  ["image/jpeg", "jpg"],
  ["image/png", "png"],
  ["image/webp", "webp"],
  ["image/gif", "gif"],
]);

const publicUploadsRoot = path.join(process.cwd(), "public", "uploads");
const materialUploadsRoot = path.join(publicUploadsRoot, "materials");

type ImageValidationResult =
  | {
      ok: true;
      extension: string;
      buffer: Buffer;
    }
  | {
      ok: false;
      error: "invalid-image" | "image-too-large";
    };

function getCurrentUploadFolder() {
  const now = new Date();
  const year = String(now.getFullYear());
  const month = String(now.getMonth() + 1).padStart(2, "0");

  return {
    relativeFolder: `${year}/${month}`,
    absoluteFolder: path.join(materialUploadsRoot, year, month),
  };
}

function detectImageExtension(buffer: Buffer) {
  if (
    buffer.length >= 3 &&
    buffer[0] === 0xff &&
    buffer[1] === 0xd8 &&
    buffer[2] === 0xff
  ) {
    return "jpg";
  }

  if (
    buffer.length >= 8 &&
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47 &&
    buffer[4] === 0x0d &&
    buffer[5] === 0x0a &&
    buffer[6] === 0x1a &&
    buffer[7] === 0x0a
  ) {
    return "png";
  }

  if (
    buffer.length >= 12 &&
    buffer.toString("ascii", 0, 4) === "RIFF" &&
    buffer.toString("ascii", 8, 12) === "WEBP"
  ) {
    return "webp";
  }

  if (
    buffer.length >= 6 &&
    (buffer.toString("ascii", 0, 6) === "GIF87a" ||
      buffer.toString("ascii", 0, 6) === "GIF89a")
  ) {
    return "gif";
  }

  return null;
}

function isSafeMaterialUploadUrl(imageUrl?: string | null): imageUrl is string {
  if (!imageUrl) return false;

  if (!imageUrl.startsWith("/uploads/materials/")) {
    return false;
  }

  if (imageUrl.includes("\\") || imageUrl.includes("..")) {
    return false;
  }

  return true;
}

async function validateImageFile(file: File): Promise<ImageValidationResult> {
  if (file.size > MAX_MATERIAL_IMAGE_SIZE) {
    return {
      ok: false,
      error: "image-too-large",
    };
  }

  const extensionByMime = allowedImageTypes.get(file.type);

  if (!extensionByMime) {
    return {
      ok: false,
      error: "invalid-image",
    };
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const detectedExtension = detectImageExtension(buffer);

  if (!detectedExtension) {
    return {
      ok: false,
      error: "invalid-image",
    };
  }

  if (detectedExtension !== extensionByMime) {
    return {
      ok: false,
      error: "invalid-image",
    };
  }

  return {
    ok: true,
    extension: detectedExtension,
    buffer,
  };
}

export async function saveMaterialImageFile(file: FormDataEntryValue | null) {
  if (!(file instanceof File) || file.size === 0) {
    return {
      ok: true as const,
      imageUrl: null,
    };
  }

  const validation = await validateImageFile(file);

  if (!validation.ok) {
    return validation;
  }

  const { relativeFolder, absoluteFolder } = getCurrentUploadFolder();
  const fileName = `${randomUUID()}.${validation.extension}`;
  const filePath = path.join(absoluteFolder, fileName);

  await mkdir(absoluteFolder, {
    recursive: true,
  });

  await writeFile(filePath, validation.buffer);

  return {
    ok: true as const,
    imageUrl: `/uploads/materials/${relativeFolder}/${fileName}`,
  };
}

export async function deleteUploadedMaterialImage(imageUrl?: string | null) {
  if (!isSafeMaterialUploadUrl(imageUrl)) {
    return;
  }

  const relativePath = imageUrl.replace("/uploads/materials/", "");
  const resolvedPath = path.resolve(materialUploadsRoot, relativePath);
  const resolvedRoot = path.resolve(materialUploadsRoot);

  if (!resolvedPath.startsWith(resolvedRoot)) {
    return;
  }

  await unlink(resolvedPath).catch(() => null);
}

async function walkUploadsFolder(folder: string): Promise<string[]> {
  const entries = await readdir(folder, {
    withFileTypes: true,
  }).catch(() => []);

  const files: string[] = [];

  for (const entry of entries) {
    const entryPath = path.join(folder, entry.name);

    if (entry.isDirectory()) {
      files.push(...(await walkUploadsFolder(entryPath)));
    } else {
      files.push(entryPath);
    }
  }

  return files;
}

export async function auditMaterialUploads() {
  const files = await walkUploadsFolder(materialUploadsRoot);

  let totalSize = 0;
  let invalidFiles = 0;

  for (const filePath of files) {
    const fileStat = await stat(filePath);
    totalSize += fileStat.size;

    const extension = path.extname(filePath).toLowerCase();
    const isValidExtension = [".jpg", ".jpeg", ".png", ".webp", ".gif"].includes(
      extension,
    );

    if (!isValidExtension) {
      invalidFiles += 1;
    }
  }

  return {
    files: files.length,
    totalSize,
    invalidFiles,
  };
}
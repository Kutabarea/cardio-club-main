import "dotenv/config";

import { copyFile, mkdir, stat } from "node:fs/promises";
import { homedir } from "node:os";
import path from "node:path";
import {
  stdin as input,
  stdout as output,
} from "node:process";
import { createInterface } from "node:readline/promises";

type PrismaInstance = typeof import("@/lib/prisma")["prisma"];

function formatDate(value: Date) {
  return new Intl.DateTimeFormat("ru-RU", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(value);
}

function shorten(value: string | null | undefined, limit = 45) {
  const normalizedValue = String(value ?? "")
    .replace(/\s+/g, " ")
    .trim();

  if (!normalizedValue) {
    return "—";
  }

  if (normalizedValue.length <= limit) {
    return normalizedValue;
  }

  return `${normalizedValue.slice(0, limit - 1)}…`;
}

function looksLikeTestValue(value?: string | null) {
  const normalizedValue = String(value ?? "")
    .trim()
    .toLowerCase()
    .replaceAll("ё", "е");

  if (!normalizedValue) {
    return false;
  }

  if (/^\d+$/.test(normalizedValue)) {
    return true;
  }

  return /^(test|testing|тест|demo|демо|qwerty|asdf|fake|temp|temporary|123)([-_\s\d]*)$/i.test(
    normalizedValue,
  );
}

function getUserFlags(user: {
  email: string;
  name: string | null;
  emailVerifiedAt: Date | null;
}) {
  const flags: string[] = [];
  const localEmailPart = user.email.split("@")[0] ?? "";

  if (
    looksLikeTestValue(localEmailPart) ||
    looksLikeTestValue(user.name)
  ) {
    flags.push("возможно тестовый");
  }

  if (!user.emailVerifiedAt) {
    flags.push("email не подтверждён");
  }

  return flags;
}

function getMaterialFlags(material: {
  title: string;
  slug: string;
  isPublished: boolean;
}) {
  const flags: string[] = [];

  if (
    looksLikeTestValue(material.title) ||
    looksLikeTestValue(material.slug)
  ) {
    flags.push("возможно тестовый");
  }

  if (!material.isPublished) {
    flags.push("черновик");
  }

  return flags;
}

function resolveSqliteDatabasePath() {
  const databaseUrl =
    process.env.DATABASE_URL?.trim() || "file:./dev.db";

  if (!databaseUrl.startsWith("file:")) {
    throw new Error(
      "Этот инструмент предназначен только для локальной SQLite базы.",
    );
  }

  let databaseLocation = databaseUrl
    .slice("file:".length)
    .split("?")[0];

  databaseLocation = decodeURIComponent(databaseLocation);

  if (/^\/[A-Za-z]:[\\/]/.test(databaseLocation)) {
    databaseLocation = databaseLocation.slice(1);
  }

  if (!databaseLocation) {
    throw new Error("В DATABASE_URL не указан файл SQLite.");
  }

  return path.isAbsolute(databaseLocation)
    ? path.normalize(databaseLocation)
    : path.resolve(process.cwd(), databaseLocation);
}

async function createDatabaseBackup() {
  const databasePath = resolveSqliteDatabasePath();

  await stat(databasePath).catch(() => {
    throw new Error(`Файл базы не найден: ${databasePath}`);
  });

  const backupDirectory = path.join(
    homedir(),
    "cardio-club-backups",
    "database",
  );

  await mkdir(backupDirectory, {
    recursive: true,
  });

  const timestamp = new Date()
    .toISOString()
    .replaceAll(":", "-")
    .replaceAll(".", "-");

  const backupPath = path.join(
    backupDirectory,
    `dev-before-cleanup-${timestamp}.db`,
  );

  await copyFile(databasePath, backupPath);

  return backupPath;
}

function parseSelection(value: string, maximum: number) {
  const normalizedValue = value.trim().toLowerCase();

  if (
    !normalizedValue ||
    normalizedValue === "none" ||
    normalizedValue === "нет"
  ) {
    return [] as number[];
  }

  if (
    normalizedValue === "all" ||
    normalizedValue === "все"
  ) {
    return Array.from(
      {
        length: maximum,
      },
      (_, index) => index + 1,
    );
  }

  const selectedNumbers = new Set<number>();
  const fragments = normalizedValue.split(",");

  for (const rawFragment of fragments) {
    const fragment = rawFragment.trim();

    if (!fragment) {
      continue;
    }

    if (/^\d+$/.test(fragment)) {
      selectedNumbers.add(Number.parseInt(fragment, 10));
      continue;
    }

    const rangeMatch = fragment.match(/^(\d+)\s*-\s*(\d+)$/);

    if (!rangeMatch) {
      throw new Error(`Неверный фрагмент выбора: ${fragment}`);
    }

    const start = Number.parseInt(rangeMatch[1], 10);
    const end = Number.parseInt(rangeMatch[2], 10);

    if (start > end) {
      throw new Error(`Неверный диапазон: ${fragment}`);
    }

    for (let number = start; number <= end; number += 1) {
      selectedNumbers.add(number);
    }
  }

  const result = [...selectedNumbers].sort(
    (first, second) => first - second,
  );

  for (const number of result) {
    if (number < 1 || number > maximum) {
      throw new Error(
        `Номер ${number} находится за пределами списка 1–${maximum}.`,
      );
    }
  }

  return result;
}

async function askForSelection(
  reader: ReturnType<typeof createInterface>,
  description: string,
  maximum: number,
) {
  if (maximum === 0) {
    return [] as number[];
  }

  while (true) {
    const answer = await reader.question(
      `${description}\n` +
        "Можно указать: 1,3,5-8; «все»; либо оставить пустым.\n> ",
    );

    try {
      return parseSelection(answer, maximum);
    } catch (error) {
      console.error(
        error instanceof Error
          ? error.message
          : "Неверный выбор.",
      );
    }
  }
}

function showUsers(
  admins: Array<{
    email: string;
    name: string | null;
  }>,
  users: Array<{
    email: string;
    name: string | null;
    emailVerifiedAt: Date | null;
    createdAt: Date;
    _count: {
      subscriptions: number;
      payments: number;
      sessions: number;
      oauthAccounts: number;
    };
  }>,
) {
  console.log("");
  console.log("ЗАЩИЩЁННЫЕ АДМИНИСТРАТОРЫ");
  console.log("-------------------------");

  if (admins.length === 0) {
    console.log("В базе нет администратора.");
  }

  for (const admin of admins) {
    console.log(
      `ADMIN | ${admin.email} | ${shorten(admin.name)}`,
    );
  }

  console.log("");
  console.log("ОБЫЧНЫЕ АККАУНТЫ");
  console.log("----------------");

  if (users.length === 0) {
    console.log("Обычных аккаунтов нет.");
  }

  users.forEach((user, index) => {
    const flags = getUserFlags(user);
    const flagText =
      flags.length > 0 ? ` | [${flags.join(", ")}]` : "";

    console.log(
      `${index + 1}. ${user.email}` +
        ` | имя: ${shorten(user.name)}` +
        ` | создан: ${formatDate(user.createdAt)}` +
        ` | подписок: ${user._count.subscriptions}` +
        ` | платежей: ${user._count.payments}` +
        ` | сессий: ${user._count.sessions}` +
        ` | OAuth: ${user._count.oauthAccounts}` +
        flagText,
    );
  });
}

function showMaterials(
  materials: Array<{
    title: string;
    slug: string;
    type: string;
    isPublished: boolean;
    isPremium: boolean;
    createdAt: Date;
    category: {
      title: string;
    } | null;
  }>,
) {
  console.log("");
  console.log("МАТЕРИАЛЫ");
  console.log("----------");

  if (materials.length === 0) {
    console.log("Материалов нет.");
  }

  materials.forEach((material, index) => {
    const flags = getMaterialFlags(material);
    const flagText =
      flags.length > 0 ? ` | [${flags.join(", ")}]` : "";

    console.log(
      `${index + 1}. ${shorten(material.title, 60)}` +
        ` | slug: ${material.slug}` +
        ` | ${material.type}` +
        ` | ${material.isPublished ? "опубликован" : "черновик"}` +
        ` | ${material.isPremium ? "Premium" : "Free"}` +
        ` | категория: ${material.category?.title ?? "без категории"}` +
        ` | создан: ${formatDate(material.createdAt)}` +
        flagText,
    );
  });
}

async function loadDatabaseRecords(prisma: PrismaInstance) {
  const [admins, users, materials] = await Promise.all([
    prisma.user.findMany({
      where: {
        role: "ADMIN",
      },
      select: {
        id: true,
        email: true,
        name: true,
      },
      orderBy: {
        createdAt: "asc",
      },
    }),

    prisma.user.findMany({
      where: {
        role: {
          not: "ADMIN",
        },
      },
      select: {
        id: true,
        email: true,
        name: true,
        emailVerifiedAt: true,
        createdAt: true,
        _count: {
          select: {
            subscriptions: true,
            payments: true,
            sessions: true,
            oauthAccounts: true,
          },
        },
      },
      orderBy: {
        createdAt: "asc",
      },
    }),

    prisma.material.findMany({
      select: {
        id: true,
        title: true,
        slug: true,
        type: true,
        imageUrl: true,
        isPublished: true,
        isPremium: true,
        createdAt: true,
        category: {
          select: {
            title: true,
          },
        },
      },
      orderBy: {
        createdAt: "asc",
      },
    }),
  ]);

  return {
    admins,
    users,
    materials,
  };
}

async function main() {
  const isPreview = process.argv.includes("--preview");

  let databaseBackupPath: string | null = null;

  if (!isPreview) {
    databaseBackupPath = await createDatabaseBackup();
  }

  const { prisma } = await import("@/lib/prisma");
  const { deleteUploadedMaterialImage } = await import(
    "@/lib/uploads"
  );

  try {
    const {
      admins,
      users,
      materials,
    } = await loadDatabaseRecords(prisma);

    showUsers(admins, users);
    showMaterials(materials);

    console.log("");
    console.log(
      `Всего: администраторов ${admins.length}, ` +
        `обычных аккаунтов ${users.length}, ` +
        `материалов ${materials.length}.`,
    );

    if (isPreview) {
      console.log("");
      console.log("Это только просмотр. База не изменена.");
      return;
    }

    console.log("");
    console.log(`Резервная копия базы: ${databaseBackupPath}`);
    console.log("");

    const reader = createInterface({
      input,
      output,
    });

    try {
      const selectedUserNumbers = await askForSelection(
        reader,
        "Какие обычные аккаунты удалить?",
        users.length,
      );

      const selectedMaterialNumbers = await askForSelection(
        reader,
        "Какие материалы удалить?",
        materials.length,
      );

      const selectedUsers = selectedUserNumbers.map(
        (number) => users[number - 1],
      );

      const selectedMaterials = selectedMaterialNumbers.map(
        (number) => materials[number - 1],
      );

      console.log("");
      console.log("БУДЕТ УДАЛЕНО");
      console.log("-------------");

      if (
        selectedUsers.length === 0 &&
        selectedMaterials.length === 0
      ) {
        console.log("Ничего не выбрано. Очистка отменена.");
        return;
      }

      for (const user of selectedUsers) {
        console.log(`Аккаунт: ${user.email}`);
      }

      for (const material of selectedMaterials) {
        console.log(
          `Материал: ${material.title} (${material.slug})`,
        );
      }

      console.log("");
      console.log(
        "Для подтверждения напиши заглавными буквами: DELETE",
      );

      const confirmation = await reader.question("> ");

      if (confirmation.trim() !== "DELETE") {
        console.log("Очистка отменена.");
        return;
      }

      const selectedUserIds = selectedUsers.map(
        (user) => user.id,
      );

      const selectedMaterialIds = selectedMaterials.map(
        (material) => material.id,
      );

      const result = await prisma.$transaction(
        async (transaction) => {
          const deletedMaterials =
            selectedMaterialIds.length > 0
              ? await transaction.material.deleteMany({
                  where: {
                    id: {
                      in: selectedMaterialIds,
                    },
                  },
                })
              : {
                  count: 0,
                };

          const deletedUsers =
            selectedUserIds.length > 0
              ? await transaction.user.deleteMany({
                  where: {
                    id: {
                      in: selectedUserIds,
                    },
                    role: {
                      not: "ADMIN",
                    },
                  },
                })
              : {
                  count: 0,
                };

          return {
            deletedMaterials: deletedMaterials.count,
            deletedUsers: deletedUsers.count,
          };
        },
      );

      for (const material of selectedMaterials) {
        await deleteUploadedMaterialImage(material.imageUrl);
      }

      const remainingUsers = await prisma.user.count();
      const remainingMaterials = await prisma.material.count();

      console.log("");
      console.log("Очистка выполнена.");
      console.log(`Удалено аккаунтов: ${result.deletedUsers}`);
      console.log(
        `Удалено материалов: ${result.deletedMaterials}`,
      );
      console.log(`Осталось аккаунтов: ${remainingUsers}`);
      console.log(`Осталось материалов: ${remainingMaterials}`);
      console.log(`Копия базы: ${databaseBackupPath}`);
    } finally {
      reader.close();
    }
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error("");
  console.error(
    error instanceof Error
      ? error.message
      : "Неизвестная ошибка очистки базы.",
  );

  process.exitCode = 1;
});
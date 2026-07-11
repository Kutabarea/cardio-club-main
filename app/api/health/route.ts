import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const [users, categories, materials] = await Promise.all([
      prisma.user.count(),
      prisma.category.count(),
      prisma.material.count(),
    ]);

    return NextResponse.json({
      ok: true,
      app: "cardio-club",
      database: "connected",
      users,
      categories,
      materials,
      checkedAt: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        app: "cardio-club",
        database: "error",
        error: error instanceof Error ? error.message : "Unknown error",
        checkedAt: new Date().toISOString(),
      },
      {
        status: 500,
      },
    );
  }
}
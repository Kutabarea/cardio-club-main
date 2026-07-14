import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const noStoreHeaders = {
  "Cache-Control": "no-store",
};

export async function GET() {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json(
      { user: null },
      {
        status: 401,
        headers: noStoreHeaders,
      },
    );
  }

  return NextResponse.json(
    { user },
    {
      headers: noStoreHeaders,
    },
  );
}
import { NextResponse } from "next/server";

import { createGoogleOAuthStartResponse } from "@/lib/googleOAuth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function getAppUrl(request: Request) {
  return (
    process.env.APP_URL ||
    new URL(request.url).origin
  ).replace(/\/$/, "");
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const returnTo = url.searchParams.get("returnTo");

  try {
    return await createGoogleOAuthStartResponse(returnTo);
  } catch (error) {
    console.error("Google OAuth start failed:", error);

    return NextResponse.redirect(
      new URL("/login?error=google-config", getAppUrl(request)),
    );
  }
}
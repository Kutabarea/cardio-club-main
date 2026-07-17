import { createGoogleOAuthCallbackResponse } from "@/lib/googleOAuth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  return createGoogleOAuthCallbackResponse(request);
}
import crypto from "node:crypto";

import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { createUserSession } from "@/lib/auth";
import { ensureCorePlan } from "@/lib/planCatalog";
import { prisma } from "@/lib/prisma";

const GOOGLE_OAUTH_STATE_COOKIE = "google_oauth_state";
const GOOGLE_OAUTH_RETURN_TO_COOKIE = "google_oauth_return_to";
const GOOGLE_PROVIDER = "google";

type GoogleTokenResponse = {
  access_token?: string;
  id_token?: string;
  expires_in?: number;
  token_type?: string;
  scope?: string;
  error?: string;
  error_description?: string;
};

type GoogleUserInfo = {
  sub?: string;
  email?: string;
  email_verified?: boolean;
  name?: string;
  picture?: string;
};

function getAppUrl() {
  return (process.env.APP_URL || "http://localhost:3000").replace(/\/$/, "");
}

function getGoogleOAuthConfig() {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const appUrl = getAppUrl();

  return {
    clientId,
    clientSecret,
    appUrl,
    redirectUri: `${appUrl}/api/auth/google/callback`,
  };
}

function requireGoogleOAuthConfig() {
  const config = getGoogleOAuthConfig();

  if (!config.clientId || !config.clientSecret) {
    throw new Error("Google OAuth is not configured.");
  }

  return {
    clientId: config.clientId,
    clientSecret: config.clientSecret,
    appUrl: config.appUrl,
    redirectUri: config.redirectUri,
  };
}

function createSecureRandomToken() {
  return crypto.randomBytes(32).toString("hex");
}

function getSafeReturnTo(value: string | null) {
  const fallback = "/profile/settings";
  const returnTo = String(value ?? "").trim();

  if (!returnTo) return fallback;
  if (!returnTo.startsWith("/")) return fallback;
  if (returnTo.startsWith("//")) return fallback;
  if (returnTo.startsWith("/api/")) return fallback;
  if (returnTo.includes("\\")) return fallback;

  return returnTo;
}

function getCookieOptions(maxAgeSeconds: number) {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: maxAgeSeconds,
  };
}

export async function createGoogleOAuthStartResponse(returnToInput: string | null) {
  const config = requireGoogleOAuthConfig();
  const state = createSecureRandomToken();
  const returnTo = getSafeReturnTo(returnToInput);

  const cookieStore = await cookies();

  cookieStore.set(
    GOOGLE_OAUTH_STATE_COOKIE,
    state,
    getCookieOptions(10 * 60),
  );

  cookieStore.set(
    GOOGLE_OAUTH_RETURN_TO_COOKIE,
    returnTo,
    getCookieOptions(10 * 60),
  );

  const authorizationUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");

  authorizationUrl.searchParams.set("client_id", config.clientId);
  authorizationUrl.searchParams.set("redirect_uri", config.redirectUri);
  authorizationUrl.searchParams.set("response_type", "code");
  authorizationUrl.searchParams.set("scope", "openid email profile");
  authorizationUrl.searchParams.set("state", state);
  authorizationUrl.searchParams.set("include_granted_scopes", "true");
  authorizationUrl.searchParams.set("prompt", "select_account");

  return NextResponse.redirect(authorizationUrl);
}

async function exchangeGoogleCodeForTokens(code: string) {
  const config = requireGoogleOAuthConfig();

  const body = new URLSearchParams({
    code,
    client_id: config.clientId,
    client_secret: config.clientSecret,
    redirect_uri: config.redirectUri,
    grant_type: "authorization_code",
  });

  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
  });

  const data = (await response.json()) as GoogleTokenResponse;

  if (!response.ok || !data.access_token) {
    throw new Error(data.error_description || data.error || "Google token exchange failed.");
  }

  return data;
}

async function fetchGoogleUserInfo(accessToken: string) {
  const response = await fetch("https://openidconnect.googleapis.com/v1/userinfo", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  const data = (await response.json()) as GoogleUserInfo;

  if (!response.ok || !data.sub || !data.email) {
    throw new Error("Google user profile request failed.");
  }

  if (!data.email_verified) {
    throw new Error("Google email is not verified.");
  }

  return {
    providerAccountId: data.sub,
    email: data.email.toLowerCase(),
    name: data.name ?? null,
    avatarUrl: data.picture ?? null,
  };
}

async function upsertUserFromGoogle(profile: {
  providerAccountId: string;
  email: string;
  name: string | null;
  avatarUrl: string | null;
}) {
  const existingAccount = await prisma.oAuthAccount.findUnique({
    where: {
      provider_providerAccountId: {
        provider: GOOGLE_PROVIDER,
        providerAccountId: profile.providerAccountId,
      },
    },
    include: {
      user: true,
    },
  });

  if (existingAccount) {
    await prisma.oAuthAccount.update({
      where: {
        id: existingAccount.id,
      },
      data: {
        email: profile.email,
        name: profile.name,
        avatarUrl: profile.avatarUrl,
      },
    });

    await prisma.user.update({
      where: {
        id: existingAccount.userId,
      },
      data: {
        emailVerifiedAt: existingAccount.user.emailVerifiedAt ?? new Date(),
        name: existingAccount.user.name ?? profile.name,
      },
    });

    await prisma.profile.upsert({
      where: {
        userId: existingAccount.userId,
      },
      create: {
        userId: existingAccount.userId,
        avatarUrl: profile.avatarUrl,
      },
      update: {
        avatarUrl: profile.avatarUrl ?? undefined,
      },
    });

    return {
      id: existingAccount.userId,
    };
  }

  const existingUser = await prisma.user.findUnique({
    where: {
      email: profile.email,
    },
    select: {
      id: true,
      name: true,
      emailVerifiedAt: true,
    },
  });

  if (existingUser) {
    await prisma.$transaction([
      prisma.oAuthAccount.create({
        data: {
          userId: existingUser.id,
          provider: GOOGLE_PROVIDER,
          providerAccountId: profile.providerAccountId,
          email: profile.email,
          name: profile.name,
          avatarUrl: profile.avatarUrl,
        },
      }),
      prisma.user.update({
        where: {
          id: existingUser.id,
        },
        data: {
          emailVerifiedAt: existingUser.emailVerifiedAt ?? new Date(),
          name: existingUser.name ?? profile.name,
        },
      }),
      prisma.profile.upsert({
        where: {
          userId: existingUser.id,
        },
        create: {
          userId: existingUser.id,
          avatarUrl: profile.avatarUrl,
        },
        update: {
          avatarUrl: profile.avatarUrl ?? undefined,
        },
      }),
    ]);

    return {
      id: existingUser.id,
    };
  }

  const freePlan = await ensureCorePlan("FREE");

  const newUser = await prisma.user.create({
    data: {
      email: profile.email,
      passwordHash: null,
      emailVerifiedAt: new Date(),
      name: profile.name,
      profile: {
        create: {
          avatarUrl: profile.avatarUrl,
        },
      },
      subscriptions: {
        create: {
          plan: "FREE",
          planId: freePlan.id,
          status: "ACTIVE",
        },
      },
      oauthAccounts: {
        create: {
          provider: GOOGLE_PROVIDER,
          providerAccountId: profile.providerAccountId,
          email: profile.email,
          name: profile.name,
          avatarUrl: profile.avatarUrl,
        },
      },
    },
    select: {
      id: true,
    },
  });

  return newUser;
}

export async function createGoogleOAuthCallbackResponse(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const state = requestUrl.searchParams.get("state");
  const error = requestUrl.searchParams.get("error");

  const cookieStore = await cookies();
  const expectedState = cookieStore.get(GOOGLE_OAUTH_STATE_COOKIE)?.value;
  const returnTo = getSafeReturnTo(
    cookieStore.get(GOOGLE_OAUTH_RETURN_TO_COOKIE)?.value ?? null,
  );

  cookieStore.delete(GOOGLE_OAUTH_STATE_COOKIE);
  cookieStore.delete(GOOGLE_OAUTH_RETURN_TO_COOKIE);

  if (error) {
    return NextResponse.redirect(new URL(`/login?error=google-${encodeURIComponent(error)}`, getAppUrl()));
  }

  if (!code || !state || !expectedState || state !== expectedState) {
    return NextResponse.redirect(new URL("/login?error=google-state", getAppUrl()));
  }

  try {
    const tokens = await exchangeGoogleCodeForTokens(code);
    const accessToken = tokens.access_token;

    if (!accessToken) {
      throw new Error("Google access token is missing.");
    }

    const googleProfile = await fetchGoogleUserInfo(accessToken);
    const user = await upsertUserFromGoogle(googleProfile);

    await createUserSession(user.id);

    return NextResponse.redirect(new URL(returnTo, getAppUrl()));
  } catch (error) {
    console.error("Google OAuth callback failed:", error);

    return NextResponse.redirect(new URL("/login?error=google-auth", getAppUrl()));
  }
}
function getAppUrl() {
  return process.env.APP_URL || "http://localhost:3000";
}

function logDevEmail(params: {
  to: string;
  subject: string;
  url: string;
}) {
  if (process.env.NODE_ENV === "production") {
    console.warn("Email provider is not configured. Message was not sent.");
    return;
  }

  console.log("");
  console.log("========================================");
  console.log("DEV EMAIL");
  console.log("To:", params.to);
  console.log("Subject:", params.subject);
  console.log("URL:", params.url);
  console.log("========================================");
  console.log("");
}

export async function sendEmailVerificationLink(params: {
  to: string;
  token: string;
}) {
  const url = `${getAppUrl()}/api/auth/verify-email?token=${params.token}`;

  logDevEmail({
    to: params.to,
    subject: "Подтверждение email CardioClub",
    url,
  });

  return {
    url,
  };
}

export async function sendPasswordResetLink(params: {
  to: string;
  token: string;
}) {
  const url = `${getAppUrl()}/reset-password?token=${params.token}`;

  logDevEmail({
    to: params.to,
    subject: "Восстановление пароля CardioClub",
    url,
  });

  return {
    url,
  };
}
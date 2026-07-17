import nodemailer from "nodemailer";

type MailPayload = {
  to: string;
  subject: string;
  text: string;
  html: string;
};

function getAppUrl() {
  return process.env.APP_URL || "http://localhost:3000";
}

function getSmtpPort() {
  const value = Number.parseInt(process.env.SMTP_PORT || "587", 10);

  return Number.isFinite(value) ? value : 587;
}

function getSmtpSecure() {
  const value = (process.env.SMTP_SECURE || "").trim().toLowerCase();

  if (value === "true") return true;
  if (value === "false") return false;

  return getSmtpPort() === 465;
}

function getSmtpFrom() {
  return process.env.SMTP_FROM || process.env.SMTP_USER || "CardioClub <no-reply@localhost>";
}

function isSmtpConfigured() {
  return Boolean(
    process.env.SMTP_HOST &&
      process.env.SMTP_USER &&
      process.env.SMTP_PASSWORD &&
      process.env.SMTP_FROM,
  );
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function createTransporter() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: getSmtpPort(),
    secure: getSmtpSecure(),
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
  });
}

function logDevEmail(params: {
  to: string;
  subject: string;
  url?: string;
  code?: string;
}) {
  console.log("");
  console.log("========================================");
  console.log("DEV EMAIL FALLBACK");
  console.log("SMTP is not configured.");
  console.log("To:", params.to);
  console.log("Subject:", params.subject);

  if (params.code) {
    console.log("Code:", params.code);
  }

  if (params.url) {
    console.log("URL:", params.url);
  }

  console.log("========================================");
  console.log("");
}

async function sendMail(payload: MailPayload) {
  if (!isSmtpConfigured()) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("SMTP is not configured.");
    }

    logDevEmail({
      to: payload.to,
      subject: payload.subject,
    });

    return {
      sent: false,
      devFallback: true,
    };
  }

  const transporter = createTransporter();

  await transporter.sendMail({
    from: getSmtpFrom(),
    to: payload.to,
    subject: payload.subject,
    text: payload.text,
    html: payload.html,
  });

  return {
    sent: true,
    devFallback: false,
  };
}

export async function verifySmtpConnection() {
  if (!isSmtpConfigured()) {
    throw new Error("SMTP is not configured.");
  }

  const transporter = createTransporter();
  await transporter.verify();

  return true;
}

export async function sendEmailVerificationCode(params: {
  to: string;
  code: string;
}) {
  const url = `${getAppUrl()}/verify-email`;
  const safeCode = escapeHtml(params.code);
  const safeUrl = escapeHtml(url);

  if (!isSmtpConfigured() && process.env.NODE_ENV !== "production") {
    logDevEmail({
      to: params.to,
      subject: "Код подтверждения email CardioClub",
      code: params.code,
      url,
    });

    return {
      code: params.code,
      url,
      sent: false,
      devFallback: true,
    };
  }

  await sendMail({
    to: params.to,
    subject: "Код подтверждения email CardioClub",
    text: [
      "Код подтверждения email CardioClub:",
      "",
      params.code,
      "",
      "Введите этот код на странице:",
      url,
      "",
      "Код действует ограниченное время.",
    ].join("\n"),
    html: `
      <div style="font-family: Arial, sans-serif; color: #111827; line-height: 1.5;">
        <h1 style="margin: 0 0 16px; font-size: 24px;">Подтверждение email</h1>
        <p style="margin: 0 0 12px;">Введите этот код на странице подтверждения CardioClub:</p>
        <div style="display: inline-block; margin: 12px 0 18px; padding: 14px 18px; border-radius: 12px; background: #eef4ff; color: #2563eb; font-size: 30px; font-weight: 800; letter-spacing: 6px;">
          ${safeCode}
        </div>
        <p style="margin: 0 0 12px;">Страница подтверждения:</p>
        <p style="margin: 0 0 18px;">
          <a href="${safeUrl}" style="color: #2563eb; font-weight: 700;">Открыть подтверждение email</a>
        </p>
        <p style="margin: 0; color: #6b7280; font-size: 14px;">Если вы не регистрировались на CardioClub, просто проигнорируйте это письмо.</p>
      </div>
    `,
  });

  return {
    code: params.code,
    url,
    sent: true,
    devFallback: false,
  };
}

/**
 * Backward-compatible export. New code should use sendEmailVerificationCode.
 */
export async function sendEmailVerificationLink(params: {
  to: string;
  token: string;
}) {
  return sendEmailVerificationCode({
    to: params.to,
    code: params.token,
  });
}

export async function sendPasswordResetLink(params: {
  to: string;
  token: string;
}) {
  const url = `${getAppUrl()}/reset-password?token=${params.token}`;
  const safeUrl = escapeHtml(url);

  if (!isSmtpConfigured() && process.env.NODE_ENV !== "production") {
    logDevEmail({
      to: params.to,
      subject: "Восстановление пароля CardioClub",
      url,
    });

    return {
      url,
      sent: false,
      devFallback: true,
    };
  }

  await sendMail({
    to: params.to,
    subject: "Восстановление пароля CardioClub",
    text: [
      "Для восстановления пароля CardioClub откройте ссылку:",
      "",
      url,
      "",
      "Если вы не запрашивали восстановление пароля, проигнорируйте это письмо.",
    ].join("\n"),
    html: `
      <div style="font-family: Arial, sans-serif; color: #111827; line-height: 1.5;">
        <h1 style="margin: 0 0 16px; font-size: 24px;">Восстановление пароля</h1>
        <p style="margin: 0 0 18px;">Нажмите на кнопку ниже, чтобы задать новый пароль.</p>
        <p style="margin: 0 0 18px;">
          <a href="${safeUrl}" style="display: inline-block; padding: 12px 18px; border-radius: 10px; background: #2563eb; color: #ffffff; text-decoration: none; font-weight: 700;">Сбросить пароль</a>
        </p>
        <p style="margin: 0 0 12px;">Если кнопка не работает, скопируйте ссылку:</p>
        <p style="margin: 0 0 18px; word-break: break-all;">
          <a href="${safeUrl}" style="color: #2563eb;">${safeUrl}</a>
        </p>
        <p style="margin: 0; color: #6b7280; font-size: 14px;">Если вы не запрашивали восстановление пароля, просто проигнорируйте это письмо.</p>
      </div>
    `,
  });

  return {
    url,
    sent: true,
    devFallback: false,
  };
}
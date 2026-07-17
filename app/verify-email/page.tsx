import { redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/auth";

import VerifyEmailForm from "./VerifyEmailForm";

export const dynamic = "force-dynamic";

export default async function VerifyEmailPage() {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    redirect("/login");
  }

  return (
    <VerifyEmailForm
      email={currentUser.email}
      isVerified={Boolean(currentUser.emailVerifiedAt)}
    />
  );
}
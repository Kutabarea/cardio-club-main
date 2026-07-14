import ResetPasswordForm from "./ResetPasswordForm";

export const dynamic = "force-dynamic";

type ResetPasswordPageProps = {
  searchParams?: Promise<{
    token?: string;
  }>;
};

export default async function ResetPasswordPage({
  searchParams,
}: ResetPasswordPageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : {};

  return <ResetPasswordForm token={resolvedSearchParams.token ?? ""} />;
}
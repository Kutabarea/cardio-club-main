import EcgBase from "@/app/components/EcgBase";

export const dynamic = "force-dynamic";

type LibraryBasePageProps = {
  searchParams?: Promise<{
    search?: string;
  }>;
};

export default async function LibraryBasePage({
  searchParams,
}: LibraryBasePageProps) {
  const params = await searchParams;

  return <EcgBase searchQuery={params?.search} />;
}
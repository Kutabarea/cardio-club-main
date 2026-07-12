import { auditMaterialUploads } from "@/lib/uploads";

function formatBytes(value: number) {
  if (value < 1024) return `${value} B`;
  if (value < 1024 * 1024) return `${(value / 1024).toFixed(2)} KB`;

  return `${(value / 1024 / 1024).toFixed(2)} MB`;
}

async function main() {
  const result = await auditMaterialUploads();

  console.log("");
  console.log("Material uploads audit");
  console.log("----------------------");
  console.log(`Files: ${result.files}`);
  console.log(`Total size: ${formatBytes(result.totalSize)}`);
  console.log(`Invalid file extensions: ${result.invalidFiles}`);
  console.log("");

  if (result.invalidFiles > 0) {
    console.log("Uploads folder contains files with unsupported extensions.");
    process.exit(1);
  }

  console.log("Uploads folder is OK.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
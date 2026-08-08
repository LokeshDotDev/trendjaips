import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";

export async function uploadFile(file: File): Promise<string> {
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const uploadDir = join(process.cwd(), "public", "uploads");
  
  // Ensure directory exists
  if (!existsSync(uploadDir)) {
    await mkdir(uploadDir, { recursive: true });
  }

  // Generate unique filename
  const filename = `${Date.now()}_${file.name.replace(/\s+/g, "_")}`;
  const filePath = join(uploadDir, filename);

  await writeFile(filePath, buffer);
  
  return `/uploads/${filename}`;
}

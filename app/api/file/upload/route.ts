import { auth } from "@clerk/nextjs/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";
import { CapsuleEncryption } from "@/lib/encryption";

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return new Response("Unauthorized", { status: 401 });
  }
  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  const capsuleId = formData.get("capsuleId") as string;

  if (!file) {
    return new Response("No file uploaded", { status: 400 });
  }

  // Read file into base64 string
  const fileBuffer = await file.arrayBuffer();
  const fileContent = Buffer.from(fileBuffer).toString("base64");
  const masterKey = process.env.FILE_ENCRYPTION_KEY;
  if (!masterKey) {
    return new Response("Missing FILE_ENCRYPTION_KEY", { status: 500 });
  }
  const { encrypted, key } = await CapsuleEncryption.encrypt(
    fileContent,
    masterKey
  );
  const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL!;
  const client = new ConvexHttpClient(convexUrl);

  const uploadUrl = await client.mutation(api.file.generateUploadUrl);
  // Upload encrypted file instead of raw
  const res = await fetch(uploadUrl, {
    method: "POST",
    headers: { "Content-Type": "text/plain" },
    body: new Blob([encrypted], { type: "text/plain" }),
  });

  if (!res.ok) {
    return new Response("Upload failed", { status: 500 });
  }

  const { storageId } = await res.json();

  await client.mutation(api.file.saveFileMetadata, {
    userId: userId as any,
    storageId,
    fileName: file.name,
    fileType: file.type,
    fileSize: file.size,
    encryptionKey: key,
  });

  return Response.json({ success: true, storageId });
}

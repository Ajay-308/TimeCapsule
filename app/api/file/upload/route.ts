import { auth } from "@clerk/nextjs/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";
import { CapsuleEncryption } from "@/lib/encryption";

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new Response("Unauthorized", { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return new Response("No file uploaded", { status: 400 });
    }

    // Convert file → base64
    const fileBuffer = await file.arrayBuffer();
    const fileContent = Buffer.from(fileBuffer).toString("base64");

    const masterKey = process.env.FILE_ENCRYPTION_KEY;
    if (!masterKey) {
      return new Response("Missing FILE_ENCRYPTION_KEY", { status: 500 });
    }

    // Encrypt file
    const { encrypted, key } = await CapsuleEncryption.encrypt(
      fileContent,
      masterKey
    );

    // Initialize Convex client
    const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL!;
    const client = new ConvexHttpClient(convexUrl);

    // Get signed upload URL from Convex
    const uploadUrl = await client.mutation(api.file.generateUploadUrl);
    console.log("Generated upload URL:", uploadUrl);

    // Upload encrypted file
    const res = await fetch(uploadUrl, {
      method: "POST",
      headers: { "Content-Type": "text/plain" },
      body: new Blob([encrypted], { type: "text/plain" }),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error("Upload failed:", res.status, errText);
      return new Response("Upload failed", { status: 500 });
    }

    const { storageId } = await res.json();

    // Save metadata in Convex
    await client.mutation(api.file.saveFileMetadata, {
      userClerkId: userId,
      storageId,
      fileName: file.name,
      fileType: file.type,
      fileSize: file.size,
      encryptionKey: key,
    });

    return Response.json({ success: true, storageId });
  } catch (err: any) {
    console.error("Error in /api/file/upload:", err);
    return new Response("Internal Server Error", { status: 500 });
  }
}

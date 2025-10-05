import { auth } from "@clerk/nextjs/server";
import cloudinary from "@/lib/cloudnary";
import { CapsuleEncryption } from "@/lib/encryption";
import { prisma } from "@/server/db";

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new Response("Unauthorized", { status: 401 });
    }
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
    });
    if (!user) {
      return new Response("User not found", { status: 404 });
    }
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const capsuleId = formData.get("capsuleId") as string | null;

    if (!file) {
      return new Response("No file uploaded", { status: 400 });
    }
    const fileBuffer = await file.arrayBuffer();
    const base64Data = Buffer.from(fileBuffer).toString("base64");
    const masterKey = process.env.FILE_ENCRYPTION_KEY!;
    const { encrypted, key } = await CapsuleEncryption.encrypt(
      base64Data,
      masterKey
    );

    const encryptedBuffer = Buffer.from(encrypted, "base64");
    const uploadResult = await new Promise<any>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: `user_uploads/${userId}`,
          resource_type: "auto",
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );

      uploadStream.end(encryptedBuffer);
    });

    const savedFile = await prisma.file.create({
      data: {
        capsuleId: capsuleId || null,
        storageId: uploadResult.public_id,
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
        encryptionKey: key,
        uploadedBy: user.id,
      },
    });

    return Response.json({
      success: true,
      message: "File uploaded successfully",
      fileUrl: uploadResult.secure_url,
      file: savedFile,
    });
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}

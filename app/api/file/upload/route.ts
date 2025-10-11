import { auth } from "@clerk/nextjs/server";
import cloudinary from "@/lib/cloudinary";
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

    // ✅ Validate file size (10MB)
    if (file.size > 10 * 1024 * 1024) {
      return Response.json(
        { error: "File size exceeds 10MB limit" },
        { status: 400 }
      );
    }

    // ✅ Convert file to buffer
    const fileBuffer = Buffer.from(await file.arrayBuffer());

    // ✅ Upload to Cloudinary (auto-detect type)
    const uploadResult = await new Promise<any>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: `user_uploads/${userId}`,
          resource_type: "auto", // 👈 handles images, videos, pdfs, etc.
          use_filename: true,
          unique_filename: false,
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      uploadStream.end(fileBuffer);
    });

    // ✅ Save metadata to DB
    const savedFile = await prisma.file.create({
      data: {
        capsuleId: capsuleId || null,
        storageId: uploadResult.public_id,
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
        uploadedBy: user.id,
        fileUrl: uploadResult.secure_url,
      },
    });

    return Response.json({
      success: true,
      message: "File uploaded successfully",
      fileUrl: uploadResult.secure_url,
      fileType: file.type,
      fileId: savedFile.id,
    });
  } catch (error: any) {
    console.error("Cloudinary upload error:", error);
    return Response.json(
      {
        error: "Failed to upload file",
        details: error?.message || error,
      },
      { status: 500 }
    );
  }
}

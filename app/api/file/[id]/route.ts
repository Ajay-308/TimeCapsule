import { NextResponse } from "next/server";
import { prisma } from "@/server/db";
import { auth } from "@clerk/nextjs/server";

// ✅ Fetch file info (GET)
export async function GET(
  _req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    const file = await prisma.file.findUnique({
      where: { id },
    });

    if (!file) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }
    return NextResponse.json({
      success: true,
      fileUrl: file.fileUrl,
      file,
    });
  } catch (error) {
    console.error("Error fetching file:", error);
    return NextResponse.json(
      { error: "Failed to fetch file" },
      { status: 500 }
    );
  }
}

// ✅ Update file capsule relation (PATCH)
export async function PATCH(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;
    const { capsuleId } = await req.json();

    const updatedFile = await prisma.file.update({
      where: { id },
      data: { capsuleId },
    });

    return NextResponse.json({
      success: true,
      fileUrl: updatedFile.fileUrl,
    });
  } catch (error) {
    console.error("Error updating file:", error);
    return NextResponse.json(
      { error: "Failed to update file" },
      { status: 500 }
    );
  }
}

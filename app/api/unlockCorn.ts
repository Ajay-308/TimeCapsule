import { prisma } from "@/server/db";
import { NextRequest, NextResponse } from "next/server";

export default async function handler(_req: NextRequest, res: NextResponse) {
  const now = new Date();

  const capsulesToUnlock = await prisma.capsule.findMany({
    where: { unlockDate: { lte: now }, isUnlocked: false },
  });

  for (const capsule of capsulesToUnlock) {
    await prisma.capsule.update({
      where: { id: capsule.id },
      data: { isUnlocked: true },
    });

    if (capsule.isPublic) {
      const existing = await prisma.publicWall.findUnique({
        where: { capsuleId: capsule.id },
      });

      if (!existing) {
        await prisma.publicWall.create({
          data: {
            capsuleId: capsule.id,
            userId: capsule.userId,
            content: capsule.content || "No content available",
            likes: 0,
            isModerated: true,
            unlockedAt: new Date(),
          },
        });
      }
    }
  }

  return NextResponse.json({
    success: true,
    unlockedCount: capsulesToUnlock.length,
  });
}

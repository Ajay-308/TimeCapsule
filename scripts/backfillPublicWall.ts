import { prisma } from "@/server/db";

async function backfillPublicWall() {
  const publicCapsules = await prisma.capsule.findMany({
    where: { isPublic: true },
    include: { publicWall: true },
  });

  for (const capsule of publicCapsules) {
    if (!capsule.publicWall) {
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
      console.log(`✅ Created PublicWall for capsule: ${capsule.id}`);
    } else {
      console.log(`⚡ Already exists: ${capsule.id}`);
    }
  }

  console.log("🎉 Backfill complete!");
}

backfillPublicWall()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });

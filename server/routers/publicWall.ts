import { z } from "zod";
import { createTRPCRouter, publicProcedure, protectedProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";

export const publicWallRouter = createTRPCRouter({
  // 📘 Get all public capsules
  getAllPublicCapsules: publicProcedure
    .input(
      z.object({
        category: z.string().optional(),
        search: z.string().optional(),
        sortBy: z.enum(["recent", "popular", "views"]).default("recent"),
      })
    )
    .query(async ({ ctx, input }) => {
      try {
        const { category, search, sortBy } = input;

        const where: any = {
          isPublic: true,
        };

        if (search) {
          where.OR = [
            { title: { contains: search, mode: "insensitive" } },
            { content: { contains: search, mode: "insensitive" } },
          ];
        }

        let orderBy: any = { unlockedAt: "desc" };
        if (sortBy === "popular") orderBy = { publicWall: { likes: "desc" } };
        else if (sortBy === "views") orderBy = { accessCount: "desc" };

        const capsules = await ctx.prisma.capsule.findMany({
          where,
          include: {
            user: {
              select: { id: true, name: true, image: true, clerkId: true },
            },
            publicWall: {
              select: { content: true, likes: true, unlockedAt: true },
            },
            files: { select: { id: true, fileName: true, fileType: true } },
          },
          orderBy,
          take: 100,
        });
        console.log("🧩 Found capsules:", capsules.length);
        console.log(
          capsules.map((c) => ({
            id: c.id,
            isPublic: c.isPublic,
            hasPublicWall: !!c.publicWall,
            isUnlocked: c.isUnlocked,
          }))
        );

        // ✅ Always return consistent data
        const transformedCapsules = capsules
          .filter((capsule) => capsule.publicWall)
          .map((capsule) => {
            const location = capsule.location as any;
            const content =
              capsule.publicWall!.content || capsule.content || "";
            const detectedCategory = determineCategory(content, capsule.title);

            // Apply category filter
            if (
              category &&
              category !== "All Categories" &&
              detectedCategory !== category
            ) {
              return null;
            }

            return {
              id: capsule.id,
              title: capsule.title,
              content,
              excerpt:
                content.substring(0, 150) + (content.length > 150 ? "..." : ""),
              author: {
                name: capsule.user.name || "Anonymous",
                image: capsule.user.image,
                location:
                  location?.city && location?.country
                    ? `${location.city}, ${location.country}`
                    : null,
              },
              unlockedAt: capsule.publicWall!.unlockedAt?.toISOString?.() ?? "",
              createdAt: capsule.createdAt?.toISOString?.() ?? "",
              unlockDate: capsule.unlockDate?.toISOString?.() ?? "",
              category: detectedCategory,
              stats: {
                views: capsule.accessCount ?? 0,
                likes: capsule.publicWall!.likes ?? 0,
                comments: 0,
              },
              featured: (capsule.publicWall!.likes ?? 0) > 50,
              tags: extractTags(content, capsule.title),
              location:
                location?.city && location?.country
                  ? `${location.city}, ${location.country}`
                  : null,
              hasFiles: capsule.files.length > 0,
              fileCount: capsule.files.length,
            };
          })
          // 👇 fix type issue by narrowing to proper type
          .filter((c): c is NonNullable<typeof c> => c !== null);

        return {
          success: true as const,
          capsules: transformedCapsules,
        };
      } catch (error) {
        console.error("Error fetching public capsules:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch public capsules",
        });
      }
    }),

  // 📘 Get single public capsule
  getPublicCapsule: publicProcedure
    .input(z.object({ capsuleId: z.string() }))
    .query(async ({ ctx, input }) => {
      try {
        const capsule = await ctx.prisma.capsule.findUnique({
          where: { id: input.capsuleId },
          include: {
            user: { select: { name: true, image: true } },
            publicWall: true,
            files: {
              select: {
                id: true,
                fileName: true,
                fileType: true,
                fileSize: true,
              },
            },
          },
        });

        if (
          !capsule ||
          !capsule.isPublic ||
          !capsule.isUnlocked ||
          !capsule.publicWall
        ) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Public capsule not found",
          });
        }

        await ctx.prisma.capsule.update({
          where: { id: input.capsuleId },
          data: { accessCount: { increment: 1 } },
        });

        const location = capsule.location as any;

        return {
          success: true as const,
          capsule: {
            id: capsule.id,
            title: capsule.title,
            content: capsule.publicWall.content,
            author: {
              name: capsule.user.name || "Anonymous",
              image: capsule.user.image,
              location:
                location?.city && location?.country
                  ? `${location.city}, ${location.country}`
                  : null,
            },
            unlockedAt: capsule.publicWall.unlockedAt,
            createdAt: capsule.createdAt,
            unlockDate: capsule.unlockDate,
            stats: {
              views: (capsule.accessCount ?? 0) + 1,
              likes: capsule.publicWall.likes ?? 0,
              comments: 0,
            },
            files: capsule.files,
          },
        };
      } catch (error) {
        console.error("Error fetching public capsule:", error);
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch public capsule",
        });
      }
    }),

  // ❤️ Like a public capsule
  likeCapsule: protectedProcedure
    .input(z.object({ capsuleId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      try {
        const { capsuleId } = input;

        const capsule = await ctx.prisma.capsule.findUnique({
          where: { id: capsuleId },
          include: { publicWall: true },
        });

        if (
          !capsule ||
          !capsule.isPublic ||
          !capsule.isUnlocked ||
          !capsule.publicWall
        ) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Public capsule not found",
          });
        }

        const updatedPublicWall = await ctx.prisma.publicWall.update({
          where: { capsuleId },
          data: { likes: { increment: 1 } },
        });

        return {
          success: true as const,
          likes: updatedPublicWall.likes,
          hasLiked: true,
        };
      } catch (error) {
        console.error("Error liking capsule:", error);
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to like capsule",
        });
      }
    }),

  // ⭐ Get featured capsules
  getFeaturedCapsules: publicProcedure.query(async ({ ctx }) => {
    try {
      const featuredCapsules = await ctx.prisma.capsule.findMany({
        where: {
          isPublic: true,
          isUnlocked: true,
          publicWall: {
            isModerated: true,
            likes: { gte: 50 },
          },
        },
        include: {
          user: { select: { name: true, image: true } },
          publicWall: true,
        },
        orderBy: { publicWall: { likes: "desc" } },
        take: 6,
      });

      return {
        success: true as const,
        capsules: featuredCapsules.map((capsule) => ({
          id: capsule.id,
          title: capsule.title,
          excerpt: capsule.publicWall!.content.substring(0, 150) + "...",
          likes: capsule.publicWall!.likes,
          author: capsule.user,
        })),
      };
    } catch (error) {
      console.error("Error fetching featured capsules:", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to fetch featured capsules",
      });
    }
  }),
});

// 🧠 Category detector
function determineCategory(content: string, title: string): string {
  const text = (content + " " + title).toLowerCase();

  if (text.match(/wedding|love|relationship/)) return "Love & Relationships";
  if (text.match(/business|startup|career/)) return "Career & Business";
  if (text.match(/family|grandma|heritage/)) return "Family & Heritage";
  if (text.match(/goal|resolution|achieve/)) return "Goals & Resolutions";
  if (text.match(/travel|adventure|trip/)) return "Travel & Adventure";
  if (text.match(/pandemic|history|historical/)) return "Historical";
  return "Personal Growth";
}

// 🏷️ Tag extractor
function extractTags(content: string, title: string): string[] {
  const text = (content + " " + title).toLowerCase();
  const commonTags = [
    "love",
    "family",
    "goals",
    "dreams",
    "wedding",
    "business",
    "travel",
    "college",
    "pandemic",
    "memories",
    "hope",
    "future",
    "past",
    "reflection",
    "growth",
    "career",
    "startup",
    "heritage",
    "recipes",
    "adventure",
  ];

  return commonTags.filter((tag) => text.includes(tag)).slice(0, 5);
}

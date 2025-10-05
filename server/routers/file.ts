import { z } from "zod";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";

export const fileRouter = createTRPCRouter({
  saveFileMetadata: protectedProcedure
    .input(
      z.object({
        capsuleId: z.string().optional(),
        storageId: z.string(),
        fileName: z.string(),
        fileType: z.string(),
        fileSize: z.number(),
        encryptionKey: z.string(),
        userClerkId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.prisma.user.findUnique({
        where: { clerkId: input.userClerkId },
      });

      if (!user) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not found",
        });
      }

      await ctx.prisma.file.create({
        data: {
          capsuleId: input.capsuleId,
          storageId: input.storageId,
          fileName: input.fileName,
          fileType: input.fileType,
          fileSize: input.fileSize,
          encryptionKey: input.encryptionKey,
          uploadedBy: user.id,
        },
      });

      return { success: true };
    }),

  getFilesByCapsuleId: publicProcedure
    .input(z.object({ capsuleId: z.string() }))
    .query(async ({ ctx, input }) => {
      const files = await ctx.prisma.file.findMany({
        where: { capsuleId: input.capsuleId },
      });

      return files;
    }),
});

import { z } from "zod";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";
import { clerkClient } from "@clerk/nextjs/server";

export const userRouter = createTRPCRouter({
  // 🧩 Sync user with Prisma DB after Clerk signup
  syncUser: protectedProcedure
    .input(
      z.object({
        name: z.string(),
        email: z.string(),
        image: z.string(),
        clerkId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const existingUser = await ctx.prisma.user.findUnique({
        where: { clerkId: input.clerkId },
      });

      if (existingUser) {
        return { exists: true, user: existingUser };
      }

      const newUser = await ctx.prisma.user.create({
        data: {
          name: input.name,
          email: input.email,
          image: input.image,
          clerkId: input.clerkId,
        },
      });

      return { exists: false, user: newUser };
    }),

  // 🧩 Get user
  getUser: publicProcedure
    .input(z.object({ clerkId: z.string() }))
    .query(async ({ ctx, input }) => {
      const user = await ctx.prisma.user.findUnique({
        where: { clerkId: input.clerkId },
      });

      if (user) return { exists: true, user };
      return { exists: false };
    }),

  // 🧩 Update profile (syncs Clerk + DB)
  updateProfile: protectedProcedure
    .input(
      z.object({
        name: z.string().optional(),
        email: z.string().email().optional(),
        // image is removed, cannot be changed
      })
    )
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.prisma.user.findUnique({
        where: { clerkId: ctx.userId },
      });

      if (!user) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not found",
        });
      }

      // Update in Clerk
      try {
        const clerk = await clerkClient();
        await clerk.users.updateUser(ctx.userId, {
          ...(input.name && { firstName: input.name.split(" ")[0] }),
          ...(input.name?.includes(" ") && {
            lastName: input.name.split(" ").slice(1).join(" "),
          }),
          ...(input.email && { emailAddress: [input.email] }),
        });
      } catch (error) {
        console.error("❌ Failed to sync with Clerk:", error);
      }

      // Update in Prisma
      const updatedUser = await ctx.prisma.user.update({
        where: { id: user.id },
        data: {
          ...(input.name && { name: input.name }),
          ...(input.email && { email: input.email }),
        },
      });

      return { success: true, user: updatedUser };
    }),

  // 🧩 Update user preferences
  updatePreferences: protectedProcedure
    .input(
      z.object({
        theme: z.enum(["system", "light", "dark"]).optional(),
        emailNotifications: z.boolean().optional(),
        pushNotifications: z.boolean().optional(),
        allowCollaborations: z.boolean().optional(),
        showOnPublicWall: z.boolean().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.prisma.user.findUnique({
        where: { clerkId: ctx.userId },
      });

      if (!user) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not found",
        });
      }

      const updatedUser = await ctx.prisma.user.update({
        where: { id: user.id },
        data: input,
      });

      return { success: true, preferences: updatedUser };
    }),

  // 🧩 Get preferences
  getPreferences: protectedProcedure.query(async ({ ctx }) => {
    const user = await ctx.prisma.user.findUnique({
      where: { clerkId: ctx.userId },
      select: {
        theme: true,
        emailNotifications: true,
        pushNotifications: true,
        allowCollaborations: true,
        showOnPublicWall: true,
      },
    });

    if (!user) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "User not found",
      });
    }

    return user;
  }),

  // 🧩 Delete account
  deleteAccount: protectedProcedure.mutation(async ({ ctx }) => {
    const user = await ctx.prisma.user.findUnique({
      where: { clerkId: ctx.userId },
    });

    if (!user) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "User not found",
      });
    }

    await ctx.prisma.capsule.deleteMany({
      where: { userId: user.id },
    });

    await ctx.prisma.user.delete({
      where: { id: user.id },
    });

    return { success: true };
  }),
});

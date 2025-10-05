import { z } from "zod";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";

export const userRouter = createTRPCRouter({
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

  getUser: publicProcedure
    .input(z.object({ clerkId: z.string() }))
    .query(async ({ ctx, input }) => {
      const user = await ctx.prisma.user.findUnique({
        where: { clerkId: input.clerkId },
      });

      if (user) {
        return { exists: true, user };
      }

      return { exists: false };
    }),
});

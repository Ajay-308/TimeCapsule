import Razorpay from "razorpay";
import crypto from "crypto";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { createTRPCRouter, protectedProcedure } from "@/server/trpc";

export const paymentRouter = createTRPCRouter({
  createOrder: protectedProcedure
    .input(
      z.object({
        amount: z.number(),
        planName: z.string(),
        billing: z.enum(["monthly", "annually"]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const razorpay = new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID!,
        key_secret: process.env.RAZORPAY_SECRET_KEY!,
      });
      // console.log("Razorpay instance created", process.env.RAZORPAY_KEY_ID);
      // console.log("razorpay secret", process.env.RAZORPAY_SECRET_KEY);

      try {
        const order = await razorpay.orders.create({
          amount: input.amount, // 💡 amount must be in paise if INR (e.g., 500 INR = 50000)
          currency: "INR", // ✅ safer default
          receipt: `receipt_${Date.now()}`,
          notes: {
            planName: input.planName,
            billing: input.billing,
            userId: ctx.userId,
          },
        });

        await ctx.prisma.order.create({
          data: {
            userId: ctx.userId,
            orderId: order.id,
            amount: input.amount,
            currency: "INR",
            planName: input.planName,
            billing: input.billing,
            status: "created",
          },
        });

        return {
          id: order.id,
          amount: order.amount,
          currency: order.currency,
        };
      } catch (error) {
        console.error("Order creation error:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create order",
        });
      }
    }),

  verifyPayment: protectedProcedure
    .input(
      z.object({
        orderId: z.string(),
        paymentId: z.string(),
        signature: z.string(),
        planName: z.string(),
        billing: z.enum(["monthly", "annually"]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const body = input.orderId + "|" + input.paymentId;
        const expectedSignature = crypto
          .createHmac("sha256", process.env.RAZORPAY_SECRET_KEY!)
          .update(body)
          .digest("hex");

        if (expectedSignature !== input.signature) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Invalid signature",
          });
        }

        const order = await ctx.prisma.order.findFirst({
          where: { orderId: input.orderId },
        });

        if (!order) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Order not found",
          });
        }

        await ctx.prisma.order.update({
          where: { id: order.id },
          data: {
            status: "paid",
            paymentId: input.paymentId,
            signature: input.signature,
            paidAt: new Date(),
          },
        });

        const user = await ctx.prisma.user.findUnique({
          where: { clerkId: ctx.userId },
        });

        if (!user) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "User not found",
          });
        }

        const subscriptionEndDate =
          input.billing === "monthly"
            ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
            : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);

        await ctx.prisma.user.update({
          where: { id: user.id },
          data: {
            subscriptionPlan: input.planName,
            subscriptionStatus: "active",
            subscriptionBilling: input.billing,
            subscriptionStartDate: new Date(),
            subscriptionEndDate,
          },
        });

        return { success: true };
      } catch (error) {
        console.error("Payment verification error:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Verification failed",
        });
      }
    }),

  cancelSubscription: protectedProcedure.mutation(async ({ ctx }) => {
    const user = await ctx.prisma.user.findUnique({
      where: { clerkId: ctx.userId },
    });

    if (!user) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "User not found",
      });
    }

    await ctx.prisma.user.update({
      where: { id: user.id },
      data: {
        subscriptionStatus: "cancelled",
        subscriptionCancelledAt: new Date(),
      },
    });

    return { success: true };
  }),

  getUserSubscription: protectedProcedure.query(async ({ ctx }) => {
    const user = await ctx.prisma.user.findUnique({
      where: { clerkId: ctx.userId },
    });

    if (!user) return null;

    return {
      plan: user.subscriptionPlan || "Personal",
      status: user.subscriptionStatus || "free",
      billing: user.subscriptionBilling,
      startDate: user.subscriptionStartDate,
      endDate: user.subscriptionEndDate,
    };
  }),
});

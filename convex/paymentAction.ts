"use node";

import { v } from "convex/values";
import { action } from "./_generated/server";
import { api, internal } from "./_generated/api";

import Razorpay from "razorpay";
import crypto from "crypto";

// Create a new order - ACTION
export const createOrder = action({
  args: {
    amount: v.number(),
    planName: v.string(),
    billing: v.union(v.literal("monthly"), v.literal("annually")),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }

    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID!,
      key_secret: process.env.RAZORPAY_KEY_SECRET!,
    });

    try {
      // Create Razorpay order
      const order = await razorpay.orders.create({
        amount: args.amount,
        currency: "USD",
        receipt: `receipt_${Date.now()}`,
        notes: {
          planName: args.planName,
          billing: args.billing,
          userId: identity.subject,
        },
      });

      // Store order in database via internal mutation
      await ctx.runMutation(internal.paymentMutations.storeOrder, {
        userId: identity.subject,
        orderId: order.id,
        amount: args.amount,
        currency: "USD",
        planName: args.planName,
        billing: args.billing,
      });

      return {
        id: order.id,
        amount: order.amount,
        currency: order.currency,
      };
    } catch (error) {
      console.error("Order creation error:", error);
      throw new Error("Failed to create order");
    }
  },
});

// Verify payment - ACTION
export const verifyPayment = action({
  args: {
    orderId: v.string(),
    paymentId: v.string(),
    signature: v.string(),
    planName: v.string(),
    billing: v.union(v.literal("monthly"), v.literal("annually")),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }

    try {
      // Verify signature
      const body = args.orderId + "|" + args.paymentId;
      const expectedSignature = crypto
        .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
        .update(body)
        .digest("hex");

      const isValid = expectedSignature === args.signature;

      if (!isValid) {
        throw new Error("Invalid signature");
      }

      // Update order and subscription via internal mutation
      await ctx.runMutation(internal.paymentMutations.updatePaymentStatus, {
        userId: identity.subject,
        orderId: args.orderId,
        paymentId: args.paymentId,
        signature: args.signature,
        planName: args.planName,
        billing: args.billing,
      });

      return { success: true };
    } catch (error) {
      console.error("Payment verification error:", error);
      return { success: false, error: "Verification failed" };
    }
  },
});

// Cancel subscription - ACTION
export const cancelSubscription = action({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }

    await ctx.runMutation(internal.paymentMutations.cancelUserSubscription, {
      userId: identity.subject,
    });

    return { success: true };
  },
});

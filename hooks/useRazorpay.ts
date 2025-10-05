"use client";

import { useCallback } from "react";
import { useUser } from "@clerk/nextjs";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";

interface PaymentOptions {
  name: string;
  price: string;
  billing: "monthly" | "annually";
}

export function useRazorpay() {
  const { user } = useUser();

  // ✅ Replace Convex actions with tRPC mutations
  const createOrder = trpc.payment.createOrder.useMutation();
  const verifyPayment = trpc.payment.verifyPayment.useMutation();

  const pay = useCallback(
    async ({ name, price, billing }: PaymentOptions) => {
      if (!user) {
        toast.error("Please sign in to continue");
        return;
      }

      try {
        // Load Razorpay script
        const script = document.createElement("script");
        script.src = "https://checkout.razorpay.com/v1/checkout.js";
        script.async = true;
        document.body.appendChild(script);

        await new Promise((resolve, reject) => {
          script.onload = resolve;
          script.onerror = reject;
        });

        const numericPrice = parseFloat(price.replace("$", ""));
        const amount = Math.round(numericPrice * 100);

        // ✅ Call your tRPC backend to create an order
        const order = await createOrder.mutateAsync({
          amount,
          planName: name,
          billing,
        });

        if (!order) {
          throw new Error("Failed to create order");
        }

        const options = {
          key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
          amount: order.amount,
          currency: order.currency,
          name: "TimeCapsule",
          description: `${name} Plan - ${
            billing === "monthly" ? "Monthly" : "Annual"
          } Subscription`,
          order_id: order.id,
          prefill: {
            name: user.fullName || "",
            email: user.emailAddresses[0]?.emailAddress || "",
          },
          theme: {
            color: "#3b82f6",
          },
          handler: async (response: any) => {
            try {
              // ✅ Verify payment using tRPC backend
              const verification = await verifyPayment.mutateAsync({
                orderId: response.razorpay_order_id,
                paymentId: response.razorpay_payment_id,
                signature: response.razorpay_signature,
                planName: name,
                billing,
              });

              if (verification.success) {
                toast.success("Payment successful! Welcome to " + name);
                window.location.href = "/dashboard";
              } else {
                toast.error("Payment verification failed");
              }
            } catch (error) {
              console.error("Payment verification error:", error);
              toast.error("Payment verification failed");
            }
          },
          modal: {
            ondismiss: () => {
              toast.info("Payment cancelled");
            },
          },
        };

        const razorpay = new (window as any).Razorpay(options);
        razorpay.open();
      } catch (error) {
        console.error("Payment error:", error);
        toast.error("Failed to initiate payment");
      }
    },
    [user, createOrder, verifyPayment]
  );

  return { pay };
}

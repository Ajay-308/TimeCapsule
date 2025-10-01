import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { amount, currency, plan } = body;

    if (!amount || !currency || !plan) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }
    const finalAmount = amount * 100;
    const res = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization:
          "Basic " +
          Buffer.from(
            `${process.env.RAZORPAY_KEY_ID}:${process.env.RAZORPAY_KEY_SECRET}`
          ).toString("base64"),
      },
      body: JSON.stringify({
        amount: finalAmount,
        currency,
        receipt: `receipt_${Date.now()}`,
        notes: {
          plan,
        },
      }),
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error("Razorpay API Error:", errorText);
      return NextResponse.json(
        { error: "Failed to create Razorpay order" },
        { status: 500 }
      );
    }

    const data = await res.json();
    return NextResponse.json({
      id: data.id,
      currency: data.currency,
      amount: data.amount,
      plan,
    });
  } catch (err: any) {
    console.error("Payment API error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

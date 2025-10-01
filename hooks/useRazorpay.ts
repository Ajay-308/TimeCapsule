// hooks/useRazorpay.ts
declare global {
  interface Window {
    Razorpay: any;
  }
}

export const useRazorpay = () => {
  const loadScript = (src: string): Promise<boolean> => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = src;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const pay = async (plan: {
    name: string;
    price: string;
    billing: string;
  }) => {
    const loaded = await loadScript(
      "https://checkout.razorpay.com/v1/checkout.js"
    );
    if (!loaded) {
      alert("Razorpay SDK failed to load");
      return;
    }

    // convert price string like "$9" → integer paise
    const numericPrice =
      plan.price === "Free" ? 0 : parseFloat(plan.price.replace("$", ""));
    const amount = numericPrice * 100 * (plan.billing === "annually" ? 12 : 1);

    const orderData = await fetch("/api/payment", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        amount,
        currency: "INR",
        plan: `${plan.name}-${plan.billing}`,
      }),
    }).then((r) => r.json());

    const options = {
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      amount: orderData.amount,
      currency: orderData.currency,
      name: "TimeCapsule",
      description: `${plan.name} Plan (${plan.billing})`,
      order_id: orderData.id,
      notes: {
        plan: plan.name,
        billing: plan.billing,
      },
      theme: { color: "#3399cc" },
    };

    const paymentObject = new window.Razorpay(options);
    paymentObject.open();
  };

  return { pay };
};

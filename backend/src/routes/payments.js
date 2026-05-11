import express from "express";
import Stripe from "stripe";

const router = express.Router();

// POST /api/payments/create-checkout-session
// Body: { items: [{ name, price, image, quantity }], successUrl, cancelUrl }
router.post("/create-checkout-session", async (req, res) => {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  const { items, successUrl, cancelUrl } = req.body;

  if (!items || items.length === 0) {
    return res.status(400).json({ error: "Cart is empty" });
  }

  const lineItems = items.map((item) => ({
    price_data: {
      currency: "usd",
      product_data: {
        name: item.name,
        ...(item.image ? { images: [item.image] } : {}),
      },
      unit_amount: Math.round(item.price * 100), // Stripe uses cents
    },
    quantity: item.quantity,
  }));

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items: lineItems,
    mode: "payment",
    success_url: successUrl,
    cancel_url: cancelUrl,
  });

  res.json({ url: session.url, sessionId: session.id });
});

export default router;

import { Router } from "express";
import { db } from "../db";
import { users } from "../db/schema";

const router = Router();

// POST /webhooks/clerk - handle Clerk user.created event
router.post("/clerk", async (req, res) => {
  const event = req.body;
  try {
    // Clerk user.created webhook payload structure
    // See: https://clerk.com/docs/reference/webhooks#user.created
    const clerkUserId = event.data?.id;
    console.log("🚀 ~ clerkUserId:", clerkUserId);
    const email =
      event.data?.email_addresses?.[0]?.email_address || "notfound@gmail.com";
    // const email =
    //   event.data?.email_addresses?.find(
    //     (e: any) => e.id === event.data.primary_email_address_id
    //   )?.email_address ?? null;
    console.log("🚀 ~ email:", email);
    if (!clerkUserId || !email) {
      res
        .status(400)
        .json({ error: "Missing Clerk user id or email in webhook payload" });
      return;
    }
    await db.insert(users).values({ clerkUserId, email });
    res.status(201).json({ created: true });
  } catch (err) {
    console.error("Error handling Clerk webhook:", err);
    res.status(500).json({ error: "Failed to create user from Clerk webhook" });
  }
});

export default router;
